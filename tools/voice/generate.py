"""Generate Kovai Streets character voices with AI4Bharat Indic Parler-TTS (runs locally on your NVIDIA GPU).

Reads every line from js/lines.js and each character's voice from tools/voice/voices.json, writes
assets/voice/<lang>/<lineId>.mp3 and updates assets/voice/manifest.json so the game plays them.
Lines that already have a file are skipped, so you can stop and resume at any time.

Examples (run from the project folder):
  python tools/voice/generate.py                       # all Tamil lines (the default voice language)
  python tools/voice/generate.py --lang en             # all English lines
  python tools/voice/generate.py --only m12_caught,m12_why --force   # redo two lines
  python tools/voice/generate.py --speaker kathir --force             # redo one character after editing voices.json
  python tools/voice/generate.py --dry-run             # list what would be generated
See tools/voice/README.md for setup.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LINES_JS = os.path.join(ROOT, "js", "lines.js")
VOICES = os.path.join(ROOT, "tools", "voice", "voices.json")
OUT = os.path.join(ROOT, "assets", "voice")
MANIFEST = os.path.join(OUT, "manifest.json")
MODEL = "ai4bharat/indic-parler-tts"


def load_lines():
    src = open(LINES_JS, encoding="utf-8").read()
    start = src.index("\nconst DIALOGUE=") + len("\nconst DIALOGUE=")   # the declaration line, not the header comment
    return json.loads(src[start:src.rindex(";")])


def spoken(text):
    """Drop stage directions such as '(on the phone)' or '(போனில்)' and tidy ellipses."""
    text = re.sub(r"\([^)]*\)", "", text)
    return re.sub(r"\s+", " ", text.replace("…", "...")).strip()


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # Windows consoles default to cp1252, which can't print Tamil
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", choices=["ta", "en", "both"], default="ta")
    ap.add_argument("--only", help="comma-separated line IDs")
    ap.add_argument("--speaker", help="only lines spoken by this voices.json key, e.g. kathir")
    ap.add_argument("--force", action="store_true", help="regenerate even if the file exists")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    lines, voices = load_lines(), json.load(open(VOICES, encoding="utf-8"))
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {"version": 1, "ta": {}, "en": {}}
    langs = ["ta", "en"] if args.lang == "both" else [args.lang]
    only = set(args.only.split(",")) if args.only else None

    jobs = []
    for lang in langs:
        os.makedirs(os.path.join(OUT, lang), exist_ok=True)
        for lid, L in lines.items():
            if only and lid not in only: continue
            if args.speaker and L["spk"] != args.speaker: continue
            if L["spk"] not in voices: sys.exit(f"voices.json has no voice for speaker '{L['spk']}' (line {lid})")
            path = os.path.join(OUT, lang, lid + ".mp3")
            if os.path.exists(path) and not args.force:
                manifest.setdefault(lang, {})[lid] = lid + ".mp3"
                continue
            jobs.append((lang, lid, L, path))

    print(f"{len(jobs)} line(s) to generate")
    if args.dry_run or not jobs:
        for lang, lid, L, _ in jobs: print(f"  [{lang}] {lid:14} {L['spk']:12} {spoken(L[lang])[:70]}")
        json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        return
    links = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Links")   # where winget puts ffmpeg
    if not shutil.which("ffmpeg") and os.path.exists(os.path.join(links, "ffmpeg.exe")):
        os.environ["PATH"] = links + os.pathsep + os.environ["PATH"]   # a terminal opened before installing ffmpeg won't have it yet
    if not shutil.which("ffmpeg"): sys.exit("ffmpeg was not found. Close this terminal, open a new one, and try again. See tools/voice/README.md.")

    import torch, soundfile as sf
    from parler_tts import ParlerTTSForConditionalGeneration
    from transformers import AutoTokenizer
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    if device == "cpu": print("WARNING: no CUDA GPU found, generation will be very slow.")
    model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL).to(device)
    tok = AutoTokenizer.from_pretrained(MODEL)
    desc_tok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

    for n, (lang, lid, L, path) in enumerate(jobs, 1):
        v = voices[L["spk"]]
        description = f"{v['description']} The speaker sounds {L.get('mood', 'neutral')}."
        torch.manual_seed(int(v.get("seed", 0)))
        d = desc_tok(description, return_tensors="pt").to(device)
        p = tok(spoken(L[lang]), return_tensors="pt").to(device)
        with torch.no_grad():
            audio = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                                   prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
        wav = os.path.join(tempfile.gettempdir(), f"kovai_{lang}_{lid}.wav")
        sf.write(wav, audio.cpu().numpy().squeeze(), model.config.sampling_rate)
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", wav]
        if v.get("filter"): cmd += ["-af", v["filter"]]
        subprocess.run(cmd + ["-codec:a", "libmp3lame", "-q:a", "4", path], check=True)
        os.remove(wav)
        manifest.setdefault(lang, {})[lid] = lid + ".mp3"
        json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)   # saved after every line
        print(f"[{n}/{len(jobs)}] {lang}/{lid}.mp3  ({L['spk']})")
    print("Done. Reload the game to hear the new voices.")


if __name__ == "__main__":
    main()
