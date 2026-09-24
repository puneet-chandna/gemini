<p align="center">
  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="120" alt="Gemini Logo"/>
</p>

<h1 align="center">
  <span style="background: linear-gradient(135deg, #4285F4, #EA4335, #FBBC04, #34A853);">✨ Gemini Clone</span>
</h1>

<p align="center">
  <b>A sleek, modern AI chat application powered by Google's Gemini 2.5 Flash</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 💬 **Chat History** | Full conversation history with scrollable messages |
| 📚 **Session Management** | Switch between sessions in the current browser tab |
| 🎨 **Dark Mode** | Sleek dark theme matching Gemini's aesthetic |
| ✨ **Markdown Support** | Rich text rendering with syntax highlighting |
| ⚡ **Response Animation** | Displays the completed response word by word |
| 📱 **Responsive Design** | Works beautifully on all devices |

---

## 🚀 Run locally

Requires Node.js 24 and a [Gemini API key](https://aistudio.google.com/apikey). The browser calls a Vercel function at `/api/chat`; the plain Vite server (`npm run dev`) renders the UI but cannot answer chat requests.

```bash
git clone https://github.com/puneet-chandna/gemini.git
cd gemini
npm ci
npx vercel link
npx vercel dev
```

Link the existing `gemini` Vercel project and set `GEMINI_API_KEY` in its Development environment before running `vercel dev`. Keep the key in Vercel environment variables; never prefix it with `VITE_` or `REACT_APP_`.

## Public deployment checklist

1. Set Node.js 24 and `GEMINI_API_KEY` for each Vercel environment that runs `/api/chat`.
2. Add a Firewall rule matching path `/api/chat` and method `POST`: five requests per client IP per 60 seconds, returning HTTP 429 above the limit. Vercel applies rate limits per region; people sharing an IP also share the limit.
3. Set a Gemini project quota or spend cap. Rotate any key that was previously included in a browser build.
4. After deployment, send one normal chat request and confirm the response. Send more than five requests from one IP within 60 seconds; confirm that excess requests receive HTTP 429 without invoking the function.

Chat sessions live in browser memory. The UI animates words after the full server response arrives; it does not stream tokens from Google.

---

## 🎨 Tech Stack

<table>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="40"/><br/><b>React</b></td>
    <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" width="40"/><br/><b>Vite</b></td>
    <td align="center"><img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="40"/><br/><b>Gemini AI</b></td>
  </tr>
</table>

---

## 📁 Project Structure

```
gemini/
├── api/chat.js           # Server-side Vercel function
├── src/
│   ├── components/
│   │   ├── main/          # Main chat interface
│   │   └── sidebar/       # Navigation sidebar
│   ├── context/           # React Context for state
│   ├── config/            # Browser API client
│   └── assets/            # Icons and images
└── package.json
```

---

## 🎯 Usage

1. **Start a conversation** - Type your prompt and press Enter
2. **Continue chatting** - Send multiple messages in the same session
3. **New Chat** - Click the + button to start a fresh conversation
4. **Load History** - Expand the sidebar to access previous chats

---

## 🌈 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🔵 **Blue** | `#4285F4` | Primary accent |
| 🔴 **Red** | `#EA4335` | Gradient element |
| 🟡 **Yellow** | `#FBBC04` | Gradient element |
| 🟢 **Green** | `#34A853` | Success states |
| ⚫ **Dark** | `#131314` | Background |
| ⬛ **Surface** | `#1E1F20` | Cards & sidebar |

---

## 📜 License

MIT © 2024

---

<p align="center">
  <b>Built with 💙 and Google Gemini API </b>
</p>

<p align="center">
  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="30"/>
</p>
