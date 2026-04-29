from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import uuid
import traceback

load_dotenv()

app = FastAPI(title="Collaborative Notes API with Custom Auth SMTP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://idyllic-uncompensated-ozie.ngrok-free.dev", 
        "http://localhost:5173", 
        "http://localhost:3000",
        # Add your Netlify URL here (e.g. "https://your-app.netlify.app")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.get("/")
async def root():
    return {"status": "success", "message": "FusionNotes Backend is Live!", "version": "1.0.1"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not supabase_url or not supabase_key:
    print("Warning: Supabase credentials not found in environment variables.")
    supabase = None
    supabase_admin = None
else:
    # We create ONE client for auth/general operations
    supabase: Client = create_client(supabase_url, supabase_key)
    # And ONE Admin client configured specifically to bypass RLS for inserts/updates
    supabase_admin: Client = create_client(supabase_url, supabase_key)

gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("Warning: Gemini API key not found in environment variables.")
    gemini_client = None
else:
    gemini_client = genai.Client(api_key=gemini_api_key)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validates the JWT token and updates last_active timestamp."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    token = credentials.credentials
    try:
        user_response = supabase_admin.auth.get_user(token) # type: ignore
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Update last_active asynchronously (don't block the request)
        if supabase_admin:
            try:
                supabase_admin.table("profiles").update({"last_active": "now()"}).eq("id", user_response.user.id).execute()
            except:
                pass # Ignore profile update errors to not block the user
            
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")


# ---- Authentication Endpoints ----

class UserRegistration(BaseModel):
    email: str
    password: str
    username: str = None

class UserVerification(BaseModel):
    email: str
    code: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register_user(user: UserRegistration):
    """
    Registers a user and bypasses Email Verification for instant login.
    Requires 'Confirm Email' to be gracefully toggled OFF in Supabase.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    try:
        res = supabase.auth.sign_up({ # type: ignore
            "email": user.email,
            "password": user.password,
            "options": {"data": {"username": user.username}}
        })
        
        if res.session:
            # Create a profile for the new user for the collaborators list
            profile_data = {
                "id": res.user.id,
                "username": user.username or user.email.split('@')[0],
                "created_at": "now()"
            }
            supabase_admin.table("profiles").upsert(profile_data).execute() # type: ignore
            
            return {
                "status": "success", 
                "message": "Account registered successfully!",
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "user": {
                    "id": res.user.id,
                    "email": res.user.email,
                    "username": user.username
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Please turn OFF 'Confirm Email' in your Supabase Auth Providers Dashboard to enable instant login!")
            
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login_user(user: UserLogin):
    """
    Logs in an existing user and returns their JWT Session Token.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        res = supabase.auth.sign_in_with_password({ # type: ignore
            "email": user.email,
            "password": user.password
        })
        # Update last_active on login
        if supabase_admin:
            try:
                supabase_admin.table("profiles").update({"last_active": "now()"}).eq("id", res.user.id).execute()
            except:
                pass

        return {
            "status": "success",
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "username": res.user.user_metadata.get('username', res.user.email.split('@')[0])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


# ---- AI & Study Enhancement Endpoints ----

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest, current_user = Depends(get_current_user)):
    """
    Processes a chat message using Gemini 1.5 Pro, aware of the user's study context.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    try:
        # Build history for Gemini
        contents = []
        for msg in request.history:
            contents.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [{"text": msg.text}]
            })
        
        # Add current message
        contents.append({
            "role": "user",
            "parts": [{"text": request.message}]
        })

        system_instruction = """
        You are 'Fusion Assistant', a high-end AI study partner for the FusionNotes app.
        Your tone is professional, encouraging, and highly efficient.
        You have access to the user's study materials (though for this specific request, just act as a general tutor).
        If the user asks about their notes, tell them you can help explain or summarize anything they've uploaded.
        Keep responses concise and formatted with Markdown. Use LaTeX for math and Mermaid for diagrams if helpful.
        """

        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash', # Using 2.0 Flash for low latency and high quality
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )

        return {
            "status": "success",
            "reply": response.text,
            "role": "ai"
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/flashcards/generate")
async def generate_flashcards(
    group_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    """
    Generates high-quality flashcards (JSON) from a group's synthesized notes.
    """
    if not supabase or not gemini_client:
        raise HTTPException(status_code=500, detail="Missing API keys")

    try:
        # Fetch synthesized notes first, fallback to raw notes
        note_data = supabase_admin.table("synthesized_notes").select("master_text").eq("group_id", group_id).order("created_at", desc=True).limit(1).execute().data
        
        if not note_data:
            # Fallback to combined raw notes
            raw_data = supabase_admin.table("raw_notes").select("extracted_text").eq("group_id", group_id).execute().data
            if not raw_data:
                raise HTTPException(status_code=404, detail="No notes found for this subject. Upload some first!")
            source_text = "\n\n".join([n['extracted_text'] for n in raw_data])
        else:
            source_text = note_data[0]['master_text']

        prompt = f"""
        You are an expert educator. Extract 5-10 high-quality study flashcards from the text below.
        Each flashcard MUST have a clear, concise 'question' and a direct 'answer'.
        
        Return ONLY a JSON array of objects with the keys "question" and "answer". 
        Do not include any other text or markdown formatting (like ```json).
        
        TEXT:
        {source_text}
        """

        response = gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        
        # Clean potential markdown from response
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text.split("```json")[-1].split("```")[0].strip()
        elif res_text.startswith("```"):
            res_text = res_text.split("```")[-1].split("```")[0].strip()

        import json
        cards = json.loads(res_text)
        
        return {
            "status": "success",
            "cards": cards
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")


# ---- Core Application Endpoints ----

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Python Backend is running securely"}


@app.post("/api/upload")
async def upload_note(
    file: UploadFile = File(...),
    group_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    if not supabase or not gemini_client:
        raise HTTPException(status_code=500, detail="Missing API keys for Supabase or Gemini")

    try:
        user_id = current_user.id
        
        file_bytes = await file.read()
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        storage_response = supabase_admin.storage.from_("notes").upload( # type: ignore
            path=f"{group_id}/{unique_filename}",
            file=file_bytes,
            file_options={"content-type": file.content_type or "image/jpeg"}
        )
        
        image_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=file.content_type or "image/jpeg"
        )
        
        prompt = "Extract all the handwritten text from this image exactly as written. If there are headings or bullet points, format them cleanly using Markdown. Only return the extracted text, no other commentary."
        
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[image_part, prompt]
            )
            extracted_text = response.text
        except Exception as gemi_e:
            print(f"Gemini OCR error: {str(gemi_e)}")
            raise HTTPException(status_code=500, detail=f"Gemini OCR failed: {str(gemi_e)}")
        
        db_data = {
            "user_id": user_id, 
            "group_id": group_id,
            "image_path": f"{group_id}/{unique_filename}",
            "extracted_text": extracted_text
        }
        db_response = supabase_admin.table("raw_notes").insert(db_data).execute() # type: ignore
        return {"status": "success", "extracted_text": extracted_text, "record": db_response.data}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/synthesize")
async def synthesize_notes(
    group_id: str = Form(...),
    current_user = Depends(get_current_user)
):
    if not supabase or not gemini_client:
        raise HTTPException(status_code=500, detail="Missing API keys")
        
    try:
        raw_notes = supabase_admin.table("raw_notes").select("extracted_text").eq("group_id", group_id).execute().data # type: ignore
        if not raw_notes:
            return {"status": "error", "message": "No notes found for this group."}
            
        combined_text = "\n\n---\n\n".join([note['extracted_text'] for note in raw_notes])
        
        prompt = f"""
        You are an expert study assistant. Below are multiple sets of lecture notes taken by different students for the same class/topic.
        Your task is to synthesize these notes into a single, comprehensive, and highly organized master study guide.
        
        CRITICAL INSTRUCTIONS:
        - Include all information from all students, even if there is overlap or redundancy (redundant info can provide different perspectives or time-period updates).
        - Organize by logical topics using Markdown headings and bullet points.
        - If the notes describe a process, timeline, hierarchy, or structural concept, automatically generate a ````mermaid```` flowchart block to visually represent it inside the guide.
        - Ensure the tone is objective and educational.
        
        Here are the raw notes:
        {combined_text}
        """
        
        try:
            gemini_response = gemini_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            master_note = gemini_response.text
        except Exception as gemi_e:
            print(f"Gemini Synthesis error: {str(gemi_e)}")
            raise HTTPException(status_code=500, detail=f"Gemini Synthesis failed: {str(gemi_e)}")
        
        db_data = {
            "group_id": group_id,
            "master_text": master_note
        }
        
        # We use upsert with on_conflict='group_id' to update the existing master guide
        # for a group while preserving all historical context in the new synthesis.
        supabase_admin.table("synthesized_notes").upsert(db_data, on_conflict="group_id").execute() # type: ignore
        return {"status": "success", "master_note": master_note}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/notes")
async def get_all_raw_notes():
    try:
        response = supabase_admin.table("raw_notes").select("*").order('created_at', desc=True).execute() # type: ignore
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/synthesized/{group_id}")
async def get_synthesized_note(group_id: str):
    try:
        # Fetch the latest synthesized note for this group
        response = supabase_admin.table("synthesized_notes").select("*").eq("group_id", group_id).order("created_at", desc=True).limit(1).execute() # type: ignore
        if not response.data:
            raise HTTPException(status_code=404, detail="No synthesized note found")
        return response.data[0]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/collaborators")
async def get_collaborators():
    """
    Returns a list of all registered users merged with their latest activity.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    try:
        # 1. Fetch all profiles
        profiles_res = supabase_admin.table("profiles").select("*").execute() # type: ignore
        profiles = {p['id']: p for p in profiles_res.data}
        
        # 2. Fetch latest note for each user to get activity
        notes_res = supabase_admin.table("raw_notes").select("user_id, group_id, created_at").order('created_at', desc=True).execute() # type: ignore
        
        latest_activity = {}
        for row in notes_res.data:
            uid = row['user_id']
            if uid not in latest_activity:
                latest_activity[uid] = {
                    "last_subject": row['group_id'].capitalize(),
                    "last_active": row['created_at']
                }
        
        # 3. Merge profiles with activity
        collaborators = []
        for uid, p in profiles.items():
            activity = latest_activity.get(uid, {
                "last_subject": "Just Joined",
                "last_active": p['last_active']
            })
            
            collaborators.append({
                "id": uid,
                "user_id": p['username'] or uid,
                "initial": (p['username'] or "S")[0].upper(),
                "last_subject": activity['last_subject'],
                "last_active": activity['last_active'],
                "online": True # Mock online status for now
            })
            
        return collaborators
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 3000)), reload=True)
