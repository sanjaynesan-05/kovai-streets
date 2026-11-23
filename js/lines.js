/* Kovai Streets: lines.js
 * Every voiced story line: speaker, Tamil text (primary), English text, mood (a hint for actors and the voice generator).
 * IDs are stable: voice files are named after them (assets/voice/<ta|en>/<id>.mp3).
 * Pure data, also read by tools/voice/generate.py, so keep it valid JSON between 'const DIALOGUE=' and the final ';'.
 * Tamil translations are drafts: have a native speaker review them.
 */
'use strict';
const DIALOGUE={
 "a1_m1_go": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "போத்தனூர் மில்லுக்கு போ. அந்த ஸ்கார்ப்பியன்ஸ விரட்டி அடி!",
  "en": "Go to the Podanur mill and chase those Scorpions out!",
  "mood": "urgent",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m1_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நன்றி! ஆனா அவங்களுக்கு மேல ஒரு பெரிய ஆள் இருக்கான்: சில்க் சுந்தரம்.",
  "en": "Nandri! But they answer to someone bigger: Silk Sundaram.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m2_go": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "அந்த கூரியர் இப்போ மில்லுக்கு பக்கத்துல தான் இருக்கான். அந்த கருப்பு SUV-ய நிறுத்து!",
  "en": "The courier is near the mills right now. Stop that black SUV!",
  "mood": "urgent",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m2_end": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நான் கதிர், அண்ணனோட மருமகன். தொழிலாளர்களுக்கு அவங்க பணம் திரும்ப கிடைச்சுடுச்சு. சுந்தரம் கொதிச்சுப் போவான்.",
  "en": "I'm Kathir, Anna's nephew. The workers got their money back. Sundaram will be furious.",
  "mood": "excited",
  "whoTa": "கதிர்"
 },
 "a1_m3_go": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "தறிகளுக்கு தீ வைக்கிறாங்க! சீக்கிரம் சிங்காநல்லூர் மில்லுக்கு வா!",
  "en": "They're torching the looms! Get to the Singanallur mill, fast!",
  "mood": "panicked",
  "whoTa": "கதிர்"
 },
 "a1_m3_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தறிகள் தப்பிச்சுடுச்சு. சுந்தரத்தோட ஆள் வெட்டு வேலு பழைய கல்குவாரி யார்டுல துப்பாக்கி வாங்குறான். அங்க கவனமா இரு.",
  "en": "The looms are safe. Sundaram's man Vettu Velu buys guns at the old quarry yard. Be careful there.",
  "mood": "calm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m4_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வேலு கதை முடிஞ்சது! அவங்க கடைசி துப்பாக்கிகள் உக்கடம் குளம் வழியா படகுல, ஒரு பழைய ஜெட்டிக்கு வருது.",
  "en": "Velu is finished! Their last guns come by boat across Ukkadam Lake, to an old jetty.",
  "mood": "pleased",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m5_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "துப்பாக்கியும் இல்ல, பணமும் இல்ல. சுந்தரம் பழைய கோவை மில்ஸ்ல ஒளிஞ்சிருக்கான். இதை முடிச்சு வை, தம்பி.",
  "en": "No guns, no money. Sundaram is hiding in the old Kovai Mills. Finish this, thambi.",
  "mood": "determined",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "a1_m6_end": {
  "spk": "sundaram",
  "who": "SILK SUNDARAM",
  "ta": "இந்த ஊர்… எனக்குத்தான் சொந்தமா இருக்கணும்…",
  "en": "This city… was supposed to be mine…",
  "mood": "dying",
  "whoTa": "சில்க் சுந்தரம்"
 },
 "m7_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தீ விபத்துக்கு அப்புறம் யாரோ எரிஞ்ச சிங்காநல்லூர் மில்ல தேடியிருக்காங்க. அவங்க எதை விட்டுட்டாங்கன்னு போய் பாரு, தம்பி.",
  "en": "Someone searched the burned Singanallur mill after the fire. Go and see what they missed, thambi.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m7_intro": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நம்ம ஊர்ல எல்லாருக்கும் தெரிஞ்சது சுந்தரம் தான். ஆனா அவனுக்கு பின்னாடி யாரோ இருக்காங்கன்னு எனக்கு எப்பவுமே சந்தேகம்.",
  "en": "Everyone in our town only knew Sundaram. But I always suspected someone was standing behind him.",
  "mood": "thoughtful",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m7_player": {
  "spk": "player",
  "who": "YOU",
  "ta": "அப்போ அது யாருன்னு நாம கண்டுபிடிப்போம்.",
  "en": "Then we find out who.",
  "mood": "determined",
  "whoTa": "நீ"
 },
 "m7_insider": {
  "spk": "player",
  "who": "YOU",
  "ta": "தீ பிடிச்ச ராத்திரியோட விசிட்டர் பாஸ்… எனக்கு தெரிஞ்ச பேரு. இப்போதைக்கு இது என்கிட்டயே இருக்கட்டும்.",
  "en": "A visitor pass from the night of the fire... with a name I know. I will keep this to myself for now.",
  "mood": "troubled",
  "whoTa": "நீ"
 },
 "m7_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "ஒரு கணக்கு புத்தகம், தென்றல் பில்டர்ஸோட நில ஒப்பந்தம்… அப்புறம் இந்த போன். ஒரு நம்பர மட்டும் கண்டுபிடிக்கவே முடியல. \"A\"ன்னு மட்டும் சேவ் பண்ணியிருக்கு.",
  "en": "A ledger, a land deal with Thendral Builders... and this phone. One contact we cannot trace. Saved only as \"A\".",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m8_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இன்னைக்கு தேவராஜன் வெள்ளை SUV-ல ஊரு முழுக்க சுத்துறான். அவன பின்தொடர், ஆனா அவன் கண்ணுல மட்டும் படாத.",
  "en": "Devarajan drives around the city today in a white SUV. Follow him, but never let him see you.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m8_call": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "(போனில்) எல்லாம் திட்டப்படி தான் நடக்குது. பழைய மில்ல பத்தி கவலைப்படாதீங்க.",
  "en": "(on the phone) Everything is moving according to the plan. Don't worry about the old mill.",
  "mood": "smooth",
  "whoTa": "தேவராஜன்"
 },
 "m8_call2": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "இந்த ஊர்ல என்ன நடக்கணும்னு நம்ம முடிவு பண்ணணும்.",
  "en": "We should be the ones deciding what happens in this town.",
  "mood": "cold",
  "whoTa": "தேவராஜன்"
 },
 "m8_photo": {
  "spk": "player",
  "who": "YOU",
  "ta": "மீட்டிங்க கேமராவுல பிடிச்சுட்டேன். முகம் தெரியல, ஆனா கார் தெரியுது.",
  "en": "Got the meeting on camera. The face is hidden, but the car isn't.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "m8_plate": {
  "spk": "player",
  "who": "YOU",
  "ta": "ரெண்டாவது காரோட நம்பர் பிளேட்டும் கிடைச்சுடுச்சு. சூப்பர்.",
  "en": "And the second car's registration number. Perfect.",
  "mood": "pleased",
  "whoTa": "நீ"
 },
 "m8_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "அந்த ரெண்டாவது கார், நான் ரொம்ப காலத்துக்கு முன்னாடி வேலை பார்த்த கம்பெனி பேருல இருக்கு. இது எனக்கு பிடிக்கல, தம்பி.",
  "en": "That second car is registered to a company I worked for, long ago. I do not like this, thambi.",
  "mood": "uneasy",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m9_brief": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "படிக்கவே தெரியாத பேப்பர்ல நம்ம தொழிலாளர்கள கையெழுத்து போட வச்சாங்க. ஒரிஜினல் என்கிட்ட இருக்கு. டவுன் ஹால் தொழிலாளர் கூட்டத்துக்கு என்னைக் கூட்டிட்டுப் போ.",
  "en": "They made our workers sign papers they could not read. I have the originals. Get me to the workers' rally at Town Hall.",
  "mood": "firm",
  "whoTa": "செல்வி அக்கா"
 },
 "m9_ambush": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "அவங்க தேவராஜனோட ஆளுங்க! தொழிலாளர்கள் பக்கம் வர விடாத!",
  "en": "Those are Devarajan's men! Keep them away from the workers!",
  "mood": "alarmed",
  "whoTa": "செல்வி அக்கா"
 },
 "m9_end": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "இது வெறும் நிலத்துக்கான சண்டை இல்ல. ஆயிரம் குடும்பங்களோட வாழ்க்கை.",
  "en": "This isn't just a fight over land. It's the lives of a thousand families.",
  "mood": "passionate",
  "whoTa": "செல்வி அக்கா"
 },
 "m9_docs": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "இந்த உரிமை பத்திரங்களோட காப்பிய நீ வச்சுக்கோ. எனக்கு ஏதாவது ஆனா, இது மக்கள்கிட்ட போய் சேரணும்.",
  "en": "Keep a copy of the ownership papers. If anything happens to me, these must reach the people.",
  "mood": "serious",
  "whoTa": "செல்வி அக்கா"
 },
 "m10_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "பத்திரங்கள் உக்கடத்துக்கு தெற்கே இருக்கிற தென்றல் பில்டர்ஸ் குடோனைக் காட்டுது. ராத்திரி போ. எல்லாத்தையும் போட்டோ எடு, யார் கண்ணுலயும் படாத.",
  "en": "The papers point to a Thendral Builders godown south of Ukkadam. Go at night. Photograph everything, and do not get seen.",
  "mood": "hushed",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m10_alarm": {
  "spk": "guard",
  "who": "GUARD",
  "ta": "யாரோ உள்ள நுழைஞ்சிட்டாங்க! கேட்ட பூட்டு!",
  "en": "Intruder! Lock the gates!",
  "mood": "shouting",
  "whoTa": "காவலாளி"
 },
 "m10_end": {
  "spk": "player",
  "who": "YOU",
  "ta": "அதிகாரிகளுக்கு பணம், மலைப்பக்கம் எங்கேயோ ஒரு சரக்கு… அப்புறம் போன்ல இருந்த அதே எழுத்து.",
  "en": "Payments to officials, a shipment to somewhere in the hills... and the same letter as on the phone.",
  "mood": "troubled",
  "whoTa": "நீ"
 },
 "m11_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இன்ஸ்பெக்டர் பாஸ்கர் உன்னை ஊருக்கு வடக்கே இருக்கிற சென்ட்ரல் போலீஸ் ஸ்டேஷன்ல பார்க்கணுமாம். தனியா. ஜாக்கிரதை.",
  "en": "Inspector Bhaskar wants to meet you at the Central police station, north of the city. Alone. Be careful.",
  "mood": "worried",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m11_a": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "முழு டிபார்ட்மென்ட்டும் காது கொடுத்து கேக்குற இடத்துல நீ சத்தம் போட்டுட்டு இருக்க.",
  "en": "You are making noise in places where the whole department is listening.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_b": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அந்த மில் தீ விபத்து இல்ல. பேப்பர்கள எரிக்கவும், தொழிலாளர்கள பயமுறுத்தவும் யாரோ ஆர்டர் போட்டாங்க.",
  "en": "That mill fire was no accident. Someone ordered it, to burn the papers and scare the workers.",
  "mood": "low",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_c": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "நான் உனக்கு உதவ முடியும். ஆனா எனக்கு பாதுகாப்பு வேணும், இல்ல ஒரு காரணம் வேணும். சொல்லு, என்ன பண்ணப் போற?",
  "en": "I can help you. But I need protection, or a reason. So what will it be?",
  "mood": "guarded",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_pay": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "சரி. என்னால முடிஞ்சத உனக்கு சொல்றேன். ஆனா நான் உன்னை நம்புவேன்னு எதிர்பார்க்காத.",
  "en": "Fine. I will pass you what I can. Don't expect me to trust you.",
  "mood": "dry",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_threat": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "…அப்போ அந்த பேப்பர்ல என் பேரும் இருக்கா. சரி. ஒத்துழைக்கிறேன். இப்போதைக்கு.",
  "en": "...So my name is in those papers too. All right. I will cooperate. For now.",
  "mood": "cornered",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_walk": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அப்போ என் வழியில நீ வராத, உன் வழியில நான் வர மாட்டேன். ஒருவேளை.",
  "en": "Then stay out of my way, and I will stay out of yours. Maybe.",
  "mood": "cold",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m11_end": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "தேவராஜன் உனக்கு கண்ணுக்குத் தெரியுற பேரு மட்டும் தான். நீ தேடுற ஆள் கைரேகை கூட விட்டுட்டுப் போக மாட்டான்.",
  "en": "Devarajan is only the name you can see. The person you are looking for doesn't leave fingerprints.",
  "mood": "ominous",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "m12_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நாம என்ன பண்ணாலும் யாரோ வெளிய சொல்லிட்டு இருக்காங்க. காந்திபுரம் பஸ் ஸ்டாண்ட் பக்கத்துல ஒரு இடத்துல இருந்து ஒரு ஸ்கூட்டர் கிளம்பிட்டே இருக்கு. அது யாருன்னு கண்டுபிடி.",
  "en": "Someone is leaking everything we do. A scooter keeps leaving a meeting spot by the Gandhipuram bus stand. Find out who.",
  "mood": "troubled",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m12_seen": {
  "spk": "player",
  "who": "YOU",
  "ta": "அந்த ஸ்கூட்டர்ல… கதிரா?!",
  "en": "That rider... Kathir?!",
  "mood": "shocked",
  "whoTa": "நீ"
 },
 "m12_caught": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நான் உன்னை ஏமாத்தணும்னு நினைக்கலடா. எனக்கு வேற வழியே இல்ல.",
  "en": "I never wanted to cheat you, da. I had no other way.",
  "mood": "tearful",
  "whoTa": "கதிர்"
 },
 "m12_why": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "அவங்க என் தங்கச்சியோட அட்ரஸ கண்டுபிடிச்சுட்டாங்க. நீ எங்க போறன்னு சொல்லலைன்னா அவள பார்க்க வருவோம்னு சொன்னாங்க. நான் அவள காப்பாத்தத்தான் பண்ணேன்.",
  "en": "They found my sister's address. Said they would visit her if I didn't tell them where you go. I was protecting her.",
  "mood": "tearful",
  "whoTa": "கதிர்"
 },
 "m12_forgive": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "…நன்றிடா. இதை நான் மறக்கவே மாட்டேன். தேவைப்படும்போது நான் உன் கூட இருப்பேன்.",
  "en": "...Thank you. I won't forget this. When it matters, I'll be there.",
  "mood": "relieved",
  "whoTa": "கதிர்"
 },
 "m12_hand": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "அவன போலீஸ்கிட்ட ஒப்படைச்சுட்டியா? அவன் நம்ம குடும்பம், தம்பி. …போ. எனக்கு கொஞ்சம் நேரம் வேணும்.",
  "en": "You handed him to the police? He was family, thambi. ...Go. I need some time.",
  "mood": "hurt",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m13_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "செல்வியக் காணோம். ஒரு சீட்டுல எழுதியிருக்கு: \"தோண்டுறத நிறுத்து, இல்லைன்னா அவ காணாம போயிடுவா.\" காட் வுல்ஃப்ஸ் அவள நகரத்துல ஒரு பழைய சுவர் சூழ்ந்த காம்பவுண்டுல வச்சிருக்காங்க.",
  "en": "Selvi is gone. A note says: \"Stop digging, or she disappears.\" The Ghat Wolves are holding her in an old walled compound in the city.",
  "mood": "desperate",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m13_found": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "நீ வந்துட்டியா! அவங்களுக்கு நில பத்திரங்கள் வேணுமாம். என்னை இங்க இருந்து கூட்டிட்டுப் போ!",
  "en": "You came! They wanted the land records. Get me out of here!",
  "mood": "relieved",
  "whoTa": "செல்வி அக்கா"
 },
 "m13_surrender": {
  "spk": "malai",
  "who": "MALAI RAJAN",
  "ta": "போதும்! போதும்… நான் சரண்டர் ஆகுறேன்.",
  "en": "Enough! Enough... I give up.",
  "mood": "beaten",
  "whoTa": "மலை ராஜன்"
 },
 "m13_leader": {
  "spk": "malai",
  "who": "MALAI RAJAN",
  "ta": "தேவராஜன் தான் எங்கள வேலைக்கு வச்சான். ஆனா அவனும் யாரோ சொல்றதக் கேக்குறான். அவன் பேப்பர்கள எல்லாம் ஒரு ரகசிய இடத்துல வச்சிருக்கான். அத \"வால்ட்\"ன்னு சொல்லுவான்.",
  "en": "Devarajan hired us. But he takes orders too. He keeps his papers in a private place. He calls it the Vault.",
  "mood": "rough",
  "whoTa": "மலை ராஜன்"
 },
 "m13_end": {
  "spk": "malai",
  "who": "MALAI RAJAN",
  "ta": "நீ தேடுற அதே ஆளப் பார்த்து தேவராஜனும் பயப்படுறான். இந்த முழு ஆட்டமும் யாருடையதுன்னு அவனுக்கே தெரியாது.",
  "en": "Devarajan is scared of the same person you are looking for. He doesn't even know who owns the whole game.",
  "mood": "rough",
  "whoTa": "மலை ராஜன்"
 },
 "m13_vault": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "அவங்க தலைவன் போன்ல பேசுனதக் கேட்டேன். தேவராஜன் எல்லாத்தையும் \"வால்ட்\"ன்னு சொல்ற ஒரு ரகசிய கிடங்குல வச்சிருக்கானாம்.",
  "en": "I heard their leader on the phone. Devarajan keeps everything in a private store he calls \"the Vault\".",
  "mood": "serious",
  "whoTa": "செல்வி அக்கா"
 },
 "m13_selvi": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "உன்னால தான் நான் உயிரோட இருக்கேன். நாளைக்கு நில பத்திரங்கள் எல்லாருக்கும் தெரிய வரும்.",
  "en": "I am alive because of you. Tomorrow, the land papers go public.",
  "mood": "grateful",
  "whoTa": "செல்வி அக்கா"
 },
 "m14_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தேவராஜன் இன்னைக்கு கோவை சென்ட்ரல் மால்ல பழைய மில்கள ஏலம் விடுறான். அது நடந்துட்டா, தொழிலாளர்கள் எல்லாத்தையும் இழந்துடுவாங்க. இதுதான் ப்ராஜெக்ட் கோவை.",
  "en": "Devarajan is auctioning the old mills today at Kovai Central mall. If it goes through, the workers lose everything. This is Project Kovai.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "m14_selvi": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "இதுதான் ஒரிஜினல் உரிமை பத்திரங்கள். இந்த ஏலமே மோசடி!",
  "en": "These are the original ownership papers. This auction is a fraud!",
  "mood": "defiant",
  "whoTa": "செல்வி அக்கா"
 },
 "m14_dev": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "அவங்கள ஒழிச்சுக் கட்டுங்க. அந்த பேப்பர்கள எரிங்க!",
  "en": "Get rid of them. Burn those papers!",
  "mood": "angry",
  "whoTa": "தேவராஜன்"
 },
 "m14_run": {
  "spk": "player",
  "who": "YOU",
  "ta": "அவன் தப்பிக்கிறான். குளத்துப் பக்கம் போறான்!",
  "en": "He's getting away. He's heading for the lake!",
  "mood": "urgent",
  "whoTa": "நீ"
 },
 "m14_q": {
  "spk": "player",
  "who": "YOU",
  "ta": "சுந்தரம், இந்த கேங், இந்த மில்... எல்லாத்துக்கும் பின்னாடி யாரு?",
  "en": "Sundaram, this gang, these mills... who is behind all of it?",
  "mood": "intense",
  "whoTa": "நீ"
 },
 "m14_d1": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "நீ என்னைத் தோற்கடிச்சிருக்கலாம். ஆனா நான் யாருக்காக வேலை பார்த்தேன்னு எனக்கே தெரியாது.",
  "en": "You may have beaten me. But even I don't know who I was working for.",
  "mood": "defeated",
  "whoTa": "தேவராஜன்"
 },
 "m14_what": {
  "spk": "player",
  "who": "YOU",
  "ta": "என்ன சொல்ற?",
  "en": "What do you mean?",
  "mood": "confused",
  "whoTa": "நீ"
 },
 "m14_d2": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "நீ தேடுற ஆள்... உன்னைப் பற்றி எனக்கு தெரிஞ்சத விட அதிகமா தெரிஞ்சிருக்கும்.",
  "en": "The person you're looking for... knows far more about you than I ever did.",
  "mood": "fearful",
  "whoTa": "தேவராஜன்"
 },
 "m14_call": {
  "spk": "architect",
  "who": "UNKNOWN CALLER",
  "ta": "ப்ராஜெக்ட் கோவை அம்பலமாயிடுச்சு. ஆபரேஷன மூடுங்க.",
  "en": "Project Kovai is compromised. Close the operation.",
  "mood": "calm",
  "whoTa": "தெரியாத அழைப்பு"
 },
 "m14_late": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "நீ ஏற்கனவே ரொம்ப லேட்.",
  "en": "You're already too late.",
  "mood": "hollow",
  "whoTa": "தேவராஜன்"
 },
 "a_police": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "என் ஆளுங்க மாலுக்கு வெளியே இருக்காங்க. அவனோட ரெண்டு காவலாளிங்க அவங்கள தாண்டி உள்ள வர முடியாது.",
  "en": "My men are outside the mall. Two of his guards won't get past them.",
  "mood": "steady",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "a_coerced": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அவனோட அடியாள் காவலாளிங்களோட உள்ள இருக்கான். என்கிட்ட இருந்து உனக்கு கிடைக்கிறது அவ்வளவுதான்.",
  "en": "His enforcer is inside, with guards. That is all you get from me.",
  "mood": "grudging",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "a_betray": {
  "spk": "radio",
  "who": "POLICE RADIO",
  "ta": "எல்லா யூனிட்டுகளுக்கும்: சந்தேக நபர் அவிநாசி ரோட்டுல கிழக்கே போறான். பலத்தைப் பயன்படுத்துங்க.",
  "en": "All units: suspect heading east on Avinashi Road. Use force.",
  "mood": "radio",
  "whoTa": "போலீஸ் வயர்லெஸ்"
 },
 "a_neutral": {
  "spk": "radio",
  "who": "POLICE RADIO",
  "ta": "எல்லா யூனிட்டுகளும் கோவை சென்ட்ரலுக்கு போங்க. சம்பந்தப்பட்ட எல்லாரையும் கைது பண்ணுங்க.",
  "en": "All units respond to Kovai Central. Detain everyone involved.",
  "mood": "radio",
  "whoTa": "போலீஸ் வயர்லெஸ்"
 },
 "a_kathir": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "என் கார எடுத்துக்கோ, வெளியதான் இருக்கு! போ, போ!",
  "en": "Take my car, it's right outside! Go, go!",
  "mood": "urgent",
  "whoTa": "கதிர்"
 },
 "a_workers": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "தொழிலாளர்கள் சாட்சியா வந்திருக்காங்க. அவன் என்ன பண்ணான்னு எல்லாருக்கும் தெரிய வரும்.",
  "en": "The workers came as witnesses. Everyone will know what he did.",
  "mood": "proud",
  "whoTa": "செல்வி அக்கா"
 },
 "end_strong": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "தொழிலாளர்களோட சாட்சியால, கோவையில தேவராஜன் பேரு முடிஞ்சு போச்சு.",
  "en": "With the workers' testimony, Devarajan's name is finished in Kovai.",
  "mood": "proud",
  "whoTa": "செல்வி அக்கா"
 },
 "end_weak": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "மில்கள அவன் இழந்துட்டான். ஆனா சாட்சி இல்லாததால அவன் பேரு தப்பிச்சுடுச்சு. இப்படிப்பட்ட ஆளுங்க எப்பவுமே தப்பிச்சுடுவாங்க.",
  "en": "He lost the mills. But without witnesses, his reputation survives. People like him always land on their feet.",
  "mood": "bitter",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_1": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வணக்கம், தம்பி. போத்தனூர்ல முப்பது வருஷம் தறி ஓட்டினேன். இப்போ ப்ளாக் ஸ்கார்ப்பியன்ஸ் வாரா வாரம் என் தொழிலாளர்கள்கிட்ட பணம் பிடுங்குறாங்க. நீ உதவுவியா?",
  "en": "Vanakkam, thambi. I ran the looms at Podanur for thirty years. Now the Black Scorpions squeeze my workers for money every week. Will you help?",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_2": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "சுந்தரம் தன்னோட \"பாதுகாப்பு\" பணத்த வசூல் பண்ண ஒரு கருப்பு SUV-ல கூரியர அனுப்புவான். இன்னைக்குதான் வசூல் நாள்.",
  "en": "Sundaram sends a courier around in a black SUV to collect his \"protection\" money. Today is collection day.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_3": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "கதிர் சொன்னது சரிதான். நமக்கு பாடம் கத்துக்கொடுக்க ஸ்கார்ப்பியன்ஸ் சிங்காநல்லூர் மில்ல தாக்குறாங்க!",
  "en": "Kathir was right. The Scorpions are attacking the Singanallur mill to teach us a lesson!",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_4": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வெட்டு வேலு பழைய கல்குவாரி யார்டுல துப்பாக்கி கடத்தல்காரங்கள சந்திக்கிறான். அந்த துப்பாக்கிகள் இல்லாம சுந்தரம் பலவீனம்.",
  "en": "Vettu Velu is meeting gun runners at the old quarry yard. Without those guns, Sundaram is weak.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_5": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "சுந்தரத்தோட கடைசி சரக்கு உக்கடம் குளத்துல இருக்கிற ஒரு பழைய ஜெட்டிக்கு ஸ்பீட்போட்டுல வருது. அதை நிறுத்து.",
  "en": "Sundaram's last shipment arrives by speedboat at an old jetty on Ukkadam Lake. Stop it.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_6": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இதுதான் கடைசி. சுந்தரமும் மிச்சமிருக்கிற எல்லா ஸ்கார்ப்பியன்ஸும் பழைய கோவை மில்ஸ்ல பதுங்கியிருக்காங்க. இன்னைக்கு ராத்திரியே முடிச்சிடு.",
  "en": "This is it. Sundaram and every Scorpion left are holed up in the old Kovai Mills. End it tonight.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_7": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தம்பி, சிங்காநல்லூர்ல எரிஞ்ச மில்லுல இன்னும் ரகசியங்கள் இருக்கு. தீக்கு அப்புறம் யாரோ அங்க தேடியிருக்காங்க. அவங்க எதை விட்டுட்டாங்கன்னு எனக்கு தெரியணும்.",
  "en": "Thambi, the burned mill at Singanallur still has secrets. Someone searched it after the fire. I want to know what they missed.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_8": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தேவராஜன் பேப்பருக்கு சிரிக்கிறான். கேமரா இல்லாதப்போ அவன் எங்க போறான்னு பார்ப்போம்.",
  "en": "Devarajan smiles for the newspapers. Let us see where he goes when the cameras are away.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_9": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "செல்வி அக்கா மில் தொழிலாளர் சங்கத்த நடத்துறாங்க. தேவராஜன் பண்ணதுக்கு அவங்ககிட்ட ஆதாரம் இருக்கு. இன்னைக்கு அவங்களுக்கு பாதுகாப்பு வேணும்.",
  "en": "Selvi Akka leads the mill workers' union. She has proof of what Devarajan did. She needs protection today.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_10": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "உரிமை பத்திரங்கள் உக்கடத்துக்கு தெற்கே இருக்கிற தென்றல் பில்டர்ஸ் குடோனுக்கு வழி காட்டுது. உள்ள இருக்கிறது நமக்கு வேணும். சத்தமில்லாம.",
  "en": "The ownership papers lead to a Thendral Builders godown south of Ukkadam. We need what is inside. Quietly.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_11": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இன்ஸ்பெக்டர் பாஸ்கர் உன்னைக் கேட்டார். தீ பத்தி அவருக்கு ஏதோ தெரியும். அவர் சொல்றதக் கேளு, ஆனா ஜாக்கிரதையா இரு.",
  "en": "Inspector Bhaskar has asked for you. He knows something about the fire. Hear him out, but watch your back.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_12": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நாம ஒவ்வொரு அடி எடுத்து வைக்கிறதுக்கு முன்னாடியே தேவராஜனுக்கு தெரிஞ்சிடுது. நமக்கு நெருக்கமான யாரோ பேசுறாங்க. எனக்கு தூக்கமே வரல, தம்பி.",
  "en": "Every move we make, Devarajan knows before we do. Someone close is talking. I cannot sleep, thambi.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_13": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "செல்விய தூக்கிட்டுப் போயிட்டாங்க. காட் வுல்ஃப்ஸ், மலைக் கடத்தல்காரங்க. அவள திரும்ப கூட்டிட்டு வா, தம்பி. ப்ளீஸ்.",
  "en": "They have taken Selvi. The Ghat Wolves, smugglers from the hills. Bring her back, thambi. Please.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_14": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இதுதான் கடைசி துண்டு, தம்பி. தேவராஜன் இன்னைக்கு கோவை சென்ட்ரல்ல மில்கள விக்கிறான். ஏலத்த நிறுத்து. அவன நிறுத்து.",
  "en": "This is the last piece, thambi. Devarajan sells the mills today at Kovai Central. Stop the auction. Stop him.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "after_1": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தேவராஜனோட வால்ட் எங்கேயோ இருக்கு. நாம தயாரானதும், அதைக் கண்டுபிடிப்போம்.",
  "en": "Devarajan's vault is out there somewhere. When we are ready, we will find it.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "after_2": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நில பத்திரங்கள் இப்போ கோர்ட்டுல இருக்குன்னு செல்வி சொல்றாங்க. தொழிலாளர்களுக்கு மறுபடியும் நம்பிக்கை வந்திருக்கு.",
  "en": "Selvi says the land papers are with the court now. The workers have hope again.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "after_3": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இன்னைக்கு யாரோ எனக்கு பூ அனுப்பியிருக்காங்க. பேரு இல்ல. \"A\"ன்னு ஒரு கார்டு மட்டும்.",
  "en": "Someone sent me flowers today. No name. Only a card with the letter A.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "gang_warn_1": {
  "spk": "gang",
  "who": "GANG MEMBER",
  "ta": "டேய்! இது எங்க ஏரியா. நடந்து போ.",
  "en": "Hey! This is our area. Keep walking.",
  "mood": "threatening",
  "whoTa": "கும்பல் ஆள்"
 },
 "gang_warn_2": {
  "spk": "gang",
  "who": "GANG MEMBER",
  "ta": "வழி தெரியலையா? அடி வாங்கும் முன்னாடி திரும்பிப் போ.",
  "en": "Lost? Turn around before you get hurt.",
  "mood": "threatening",
  "whoTa": "கும்பல் ஆள்"
 },
 "gang_attack": {
  "spk": "gang",
  "who": "GANG MEMBER",
  "ta": "அவ்வளவுதான். அவனைப் பிடிங்கடா!",
  "en": "That's it. Get him!",
  "mood": "angry",
  "whoTa": "கும்பல் ஆள்"
 }
};
