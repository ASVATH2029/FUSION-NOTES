# 🌌 FusionNotes

Yoo! Welcome to **FusionNotes**! ngl, we spent a crazy amount of time cooking up this UI, and tbh it looks absolutely insane. We didn't just build another note-taking app—we built an aesthetic powerhouse. If you're a fan of those sleek, moody, and ultra-smooth setups (iykyk, heavy Hyprland/Linux visual vibes), you're gonna feel right at home here. It's a massive **W** for anyone who loves high-end UX design combined with heavy utility. Oh, and by the way, this entire project and its UI are completely **open source**!

## ✨ The Sauce (UI/UX Features)
Here is what we packed into this beauty fr:

*   **Monochrome Mastery & High-Res Glassmorphism:** We completely dropped the loud colors for a sleek, high-contrast black-and-white design system. The background features beautifully abstract, color-matched backdrops that we custom-created using Canva. Everything sits securely on top of translucent, ultra-blurred glass panels.
*   **Adaptive Logo System:** No more crusty, pixelated, or squished boxes! The app uses a flawlessly crisp, custom transparent logo that dynamically responds to whether you are using Dark Mode or Light Mode automatically. 
*   **Hyprland Physics:** We ain't using standard boring CSS transitions. Every button pop, hover effect, floating panel, and overlay entrance uses an over-damped spring animation (scaling safely from `0.95` to `1.0`) so it feels bouncy, snappy, and alive on screen.
*   **Floating UX Panels:** Click your profile avatar or the notification bell, and the rest of the app subtly blurs away into the background while a gorgeous, glass-style popout panel springs right into view. Click anywhere outside to playfully dismiss it.
*   **Swipe-to-Dismiss Live Notifications:** Built a massive real-time toast notification system. But it's not just a popup; you can actually physically click, hold, and swipe the popup out to the right to throw it off the screen! If you barely swipe it, it snaps completely back into place. Oh, and there's a neat pulsing unread red badge on the bell icon too.
*   **Custom Scrollwheels:** Standard WebKit scrollbars natively hide and look kind of basic tbh. We completely replaced them globally with a custom pill-shaped track and an interactive glass thumb so you always know exactly where you are inside your dashboard and lists.
*   **Keyboard-driven Flashcards:** Studying is serious business. Hit `Spacebar` to instantly flip a targeted flashcard, use `Left/Right Arrows` to quickly navigate your deck backwards or forwards, and simply smack `1`, `2`, or `3` to quickly rate how hard it was. No mouse needed!
*   **One-Click Intelligent Filtering:** Looking for Math stuff? Just click the 'Math' pill tag right directly on any individual note card, and it instantly teleports you inside your main Notes library with the specific category perfectly pre-filtered for you.

## 🛠️ Tech Stack & Libraries
We wanted to keep the performance blisteringly fast while pushing heavy visuals, so here's what we built this completely open source project with:
*   **React 18** (UI structure)
*   **Vite** (Insane build speeds & hot-reloading)
*   **TypeScript** (Type safety for all our components)
*   **Lucide React** (All those clean, crisp icons you see globally)
*   **Canva** (For color matching and generating the high-res custom backdrops)

Hope you enjoy the vibes!

---

### 📖 LEGENDS (Glossary)
Just in case you aren't perfectly familiar with the lingo used above, here are the full translations for the abbreviations used within this repo:
*   **ngl:** Not gonna lie
*   **tbh:** To be honest
*   **fr:** For real
*   **iykyk:** If you know, you know
*   **W:** Win / Total victory / Huge success
*   **UX:** User Experience (how the interactions feel to you)
*   **UI:** User Interface (how the visuals and app looks)
*   **btw:** By the way