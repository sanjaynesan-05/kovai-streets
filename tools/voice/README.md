# Character voices

The game plays a recording for each story line, if one exists:

- **Where files go:** `assets/voice/<lang>/<lineId>.mp3`
- **Which files the game knows about:** `assets/voice/manifest.json`
- **Missing recordings:** the line is shown as subtitles only.

Tamil is the default voice language. Players can switch to English, and change subtitles and dialogue volume, in **Settings** (main menu or pause menu).

| File | What it is |
|---|---|
| `js/lines.js` | Every line: ID, speaker, Tamil text, English text, mood. **Edit text here.** |
| `tools/voice/voices.json` | One voice description per character, plus a seed and an optional audio filter |
| `tools/voice/generate.py` | Creates the MP3s with AI4Bharat Indic Parler-TTS on your own PC |
| `assets/voice/manifest.json` | Updated automatically by `generate.py`. Edit it by hand only when you add your own recordings |

## One-time setup (Windows, NVIDIA GPU)

1. **Install Python 3.10 or 3.11** from python.org. Tick "Add Python to PATH".
2. **Install ffmpeg:** run `winget install Gyan.FFmpeg`. Then **close the terminal and open a new one**, and check that `ffmpeg -version` works.
3. **Create a separate environment for the voice tool.** `parler-tts` needs older versions of `transformers` and `protobuf`, so installing it into your main Python breaks other tools such as whisperx, tensorflow and streamlit. Run these from the project folder in PowerShell:
   ```
   python -m venv .venv-voice
   Set-ExecutionPolicy -Scope Process Bypass
   .venv-voice\Scripts\Activate.ps1
   ```
   Your prompt now starts with `(.venv-voice)`. Run step 4 and every `generate.py` command in a terminal like this. In a new terminal, run the last two lines again first.
4. **Install PyTorch with CUDA, then the TTS library** (inside the environment). Pick the PyTorch command for your CUDA version at https://pytorch.org/get-started/locally/. For example:
   ```
   pip install torch --index-url https://download.pytorch.org/whl/cu128
   pip install git+https://github.com/huggingface/parler-tts.git soundfile
   ```
5. **First run:** the model (`ai4bharat/indic-parler-tts`, a few GB) downloads from Hugging Face automatically. If the download asks for access, open the model page while logged in to Hugging Face, accept the terms, then run `huggingface-cli login`.

**Licence:** check the licence on the official model page (https://huggingface.co/ai4bharat/indic-parler-tts) before you publish the game.

## Generate

Run these from the project folder:

```
python tools/voice/generate.py --dry-run     # see the list first
python tools/voice/generate.py               # all Tamil lines
python tools/voice/generate.py --lang en     # English versions (for players who pick English)
```

- **Resuming:** existing files are skipped, so you can stop and run it again later.
- **Hearing the voices:** reload the game in the browser. It must run through `start-server.bat`, because the voice files can't load when the page is opened as a file.

## Improving a voice

- **A whole character:** edit their `description` (or try another `seed`) in `voices.json`, then regenerate that character:
  ```
  python tools/voice/generate.py --speaker kathir --force
  ```
- **A single bad take:**
  ```
  python tools/voice/generate.py --only m12_caught --force
  ```
  Changing that speaker's `seed` gives a different take.
- **A line's wording:** fix the Tamil or English text in `js/lines.js`, then regenerate that line with `--only <id> --force`.

## Replacing AI voices with real recordings later

1. Record the line. Read the Tamil text from `js/lines.js`, and use the `mood` field as direction.
2. Export it as MP3 and save it as `assets/voice/ta/<lineId>.mp3`, replacing the AI file.

The game picks it up on the next reload, and no code changes are needed. Get each actor's written permission to use their voice.

## Notes

- **Translations:** the Tamil lines are drafts written for the game. Ask a native speaker to review them, especially the emotional scenes.
- **Accent:** AI voices speak standard Tamil, not the Coimbatore (Kongu) accent. Replace the most important lines with actors first: Kathir's confession (`m12_caught`, `m12_why`) and the finale (`m14_*`).
- **Effects:** The Architect (`architect`) and the police radio (`radio`) get audio effects from the `filter` field in `voices.json`.
