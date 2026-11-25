/* Kovai Streets: lines.js
 * Every voiced story line: speaker, Tamil text (primary), English text, mood (a hint for actors and the voice generator).
 * IDs are stable: voice files are named after them (assets/voice/<ta|en>/<id>.mp3).
 * Pure data, also read by tools/voice/generate.py, so keep it valid JSON between 'const DIALOGUE=' and the final ';'.
 * Tamil translations are drafts: have a native speaker review them.
 */
'use strict';
const DIALOGUE={
 "m7_brief": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தீ விபத்துக்கு அப்புறம் யாரோ மில் எஸ்டேட்ல எரிஞ்ச மில்ல தேடியிருக்காங்க. அவங்க எதை விட்டுட்டாங்கன்னு போய் பாரு, தம்பி.",
  "en": "Someone searched the burned spinning mill in Mill Estate after the fire. Go and see what they missed, thambi.",
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
  "ta": "படிக்கவே தெரியாத பேப்பர்ல நம்ம தொழிலாளர்கள கையெழுத்து போட வச்சாங்க. ஒரிஜினல் என்கிட்ட இருக்கு. டவுன் ஹால் சதுக்கத்துல நடக்கிற தொழிலாளர் கூட்டத்துக்கு என்னைக் கூட்டிட்டுப் போ.",
  "en": "They made our workers sign papers they could not read. I have the originals. Get me to the workers' rally at Town Hall Square.",
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
  "ta": "பத்திரங்கள் கிரீன்ஃபீல்ட்ல இருக்கிற தென்றல் பில்டர்ஸ் குடோனைக் காட்டுது. ராத்திரி போ. எல்லாத்தையும் போட்டோ எடு, யார் கண்ணுலயும் படாத.",
  "en": "The papers point to a Thendral Builders godown in Greenfield. Go at night. Photograph everything, and do not get seen.",
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
  "ta": "நாம என்ன பண்ணாலும் யாரோ வெளிய சொல்லிட்டு இருக்காங்க. கேம்பஸ் நகர்ல காலேஜ் பக்கத்துல ஒரு இடத்துல இருந்து ஒரு ஸ்கூட்டர் கிளம்பிட்டே இருக்கு. அது யாருன்னு கண்டுபிடி.",
  "en": "Someone is leaking everything we do. A scooter keeps leaving a meeting spot by the college in Campus Nagar. Find out who.",
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
  "ta": "செல்வியக் காணோம். ஒரு சீட்டுல எழுதியிருக்கு: \"தோண்டுறத நிறுத்து, இல்லைன்னா அவ காணாம போயிடுவா.\" காட் வுல்ஃப்ஸ் அவள ஹில்க்ரெஸ்ட்ல ஒரு சுவர் சூழ்ந்த காம்பவுண்டுல வச்சிருக்காங்க.",
  "en": "Selvi is gone. A note says: \"Stop digging, or she disappears.\" The Ghat Wolves are holding her in a walled compound up in Hillcrest.",
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
  "ta": "எல்லா யூனிட்டுகளுக்கும்: சந்தேக நபர் ஃப்ளைஓவர் வழியா சில்வர் லேக் பக்கம் போறான். பலத்தைப் பயன்படுத்துங்க.",
  "en": "All units: suspect heading over the flyover towards Silver Lake. Use force.",
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
  "ta": "வணக்கம் தம்பி. முப்பது வருஷம் இந்த மில் எஸ்டேட் மில்லுல தறி ஓட்டினேன். இப்போ பிளாக் ஸ்கார்ப்பியன்ஸ் என் தொழிலாளிங்ககிட்ட வாரா வாரம் பணம் பிடுங்கறாங்க. உள்ள போய் அவங்ககிட்ட பேசு.",
  "en": "Vanakkam, thambi. I ran the looms at this Mill Estate mill for thirty years. Now the Black Scorpions squeeze my workers every week. Go in and talk to them.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_2": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "சுந்தரம் ஒரு கருப்பு SUV-ல வசூலுக்கு ஆள் அனுப்புவான். இன்னைக்கு வசூல் நாள். என் மருமகன் கதிர் உனக்கு வழி காட்டுவான்.",
  "en": "Sundaram sends a collector round in a black SUV. Today is collection day. My nephew Kathir will show you.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_3": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தம்பி! ஸ்பின்னிங் மில்ல தாக்கறாங்க! தொழிலாளிங்க உள்ள இருக்காங்க. சீக்கிரம் போ!",
  "en": "Thambi! They are attacking the spinning mill! The workers are inside. Go, quickly!",
  "mood": "urgent",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_4": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வெட்டு வேலு சில்வர் ஹில் குவாரியில துப்பாக்கி வியாபாரம் பண்றான். முதல்ல பாரு, போட்டோ எடு, அப்புறம் அடி.",
  "en": "Vettu Velu is buying guns at the Silver Hill quarry. Watch first, take photos, then strike.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_5": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "கடைசி சரக்கு சில்வர் லேக் ஜெட்டிக்கு படகுல வருது. அங்க ஒரு மீனவர் ஏதோ பார்த்திருக்கார்.",
  "en": "The last shipment comes to the Silver Lake jetty by boat. A fisherman there has seen something.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_6": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "சுந்தரம் ஓல்ட் கோவை மில்ஸ்ல ஒளிஞ்சிருக்கான். நம்ம ஆளுங்களையும் உள்ள அடைச்சு வச்சிருக்கான். கதிரை கூட்டிட்டு போ. இன்னைக்கு ராத்திரி முடிச்சிடு.",
  "en": "Sundaram is hiding in Old Kovai Mills, and he is holding our people inside. Take Kathir. End it tonight.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_7": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தம்பி, மில் எஸ்டேட்ல எரிஞ்ச மில்லுல இன்னும் ரகசியங்கள் இருக்கு. தீக்கு அப்புறம் யாரோ அங்க தேடியிருக்காங்க. அவங்க எதை விட்டுட்டாங்கன்னு எனக்கு தெரியணும்.",
  "en": "Thambi, the burned mill in Mill Estate still has secrets. Someone searched it after the fire. I want to know what they missed.",
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
  "ta": "உரிமை பத்திரங்கள் கிரீன்ஃபீல்ட்ல இருக்கிற தென்றல் பில்டர்ஸ் குடோனுக்கு வழி காட்டுது. உள்ள இருக்கிறது நமக்கு வேணும். சத்தமில்லாம.",
  "en": "The ownership papers lead to a Thendral Builders godown in Greenfield. We need what is inside. Quietly.",
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
 },
 "r4_m1_w1": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "வாரா வாரம் பாதி சம்பளம் அவங்களுக்கு போகுது. கொடுக்கலனா அடிக்கறாங்க.",
  "en": "Half our wages go to them every week. If we refuse, they beat us.",
  "mood": "tired",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m1_w2": {
  "spk": "worker_f",
  "who": "MILL WORKER",
  "ta": "நேத்து ராத்திரி மில்லுக்குள்ளயே வந்து உட்கார்ந்துட்டாங்க. தறி பக்கம் போக விடல.",
  "en": "Last night they moved into the mill itself. They will not let us near the looms.",
  "mood": "afraid",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m1_w3": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "முன்வாசல்ல காவல் இருக்கு. பக்கவாட்டு வாசல் திறந்திருக்கு, தம்பி.",
  "en": "The front door is guarded. The side door is open, thambi.",
  "mood": "hushed",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m1_recog": {
  "spk": "gang",
  "who": "SCORPION",
  "ta": "இவனா? சுந்தரம் அண்ணன் உன்ன பார்க்கணும்னு சொல்லுவாரு!",
  "en": "You? Sundaram Anna will want to meet you!",
  "mood": "menacing",
  "whoTa": "ஸ்கார்ப்பியன்"
 },
 "r4_m1_beaten": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "நன்றி தம்பி… இன்னும் ஆளுங்க வர்றாங்க. ஓடு!",
  "en": "Thank you, thambi… more of them are coming. Run!",
  "mood": "tired",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m1_register": {
  "spk": "player",
  "who": "YOU",
  "ta": "தொழிலாளிங்க சம்பள ரிஜிஸ்டர். யாரு எவ்வளவு கொடுத்தாங்கன்னு எல்லாம் இருக்கு.",
  "en": "The workers' pay register. Every rupee they were forced to pay is in here.",
  "mood": "neutral",
  "whoTa": "நீ"
 },
 "r4_m1_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நன்றி தம்பி. ஆனா அவங்க சின்ன ஆளுங்க. மேல ஒருத்தன் இருக்கான்: சில்க் சுந்தரம்.",
  "en": "Thank you, thambi. But those were small men. Someone bigger is above them: Silk Sundaram.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r4_m2_kathir": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நான் கதிர், அண்ணனோட மருமகன். கருப்பு SUV மூணு கடையில வசூல் பண்ணும். தூரத்துல இருந்து பின்தொடர்.",
  "en": "I am Kathir, Anna's nephew. The black SUV collects at three shops. Follow it from a distance.",
  "mood": "eager",
  "whoTa": "கதிர்"
 },
 "r4_m2_shop": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "பார்த்தியா? கடைக்காரர் கை நடுங்குது. அடுத்த கடைக்கு போறாங்க.",
  "en": "See that? The shopkeeper's hands are shaking. They are moving to the next shop.",
  "mood": "hushed",
  "whoTa": "கதிர்"
 },
 "r4_m2_block": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நான் சந்திப்புல வழி மறிக்கறேன். இப்போ போ!",
  "en": "I will block them at the junction. Go now!",
  "mood": "urgent",
  "whoTa": "கதிர்"
 },
 "r4_m2_end": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "பணம் திரும்ப வந்துடுச்சு. சொல்லு, அவங்க அடுத்து எங்க போவாங்க? எத்தனை பேர் இருக்காங்க?",
  "en": "The money is back. Tell me, where do they go next? How many of them are there?",
  "mood": "curious",
  "whoTa": "கதிர்"
 },
 "r4_m3_evac": {
  "spk": "worker_f",
  "who": "MILL WORKER",
  "ta": "எல்லாரும் வெளிய வாங்க! தீ வைக்க வர்றாங்க!",
  "en": "Everyone out! They have come to set fire to it!",
  "mood": "afraid",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m3_flee": {
  "spk": "player",
  "who": "YOU",
  "ta": "ஒருத்தன் ஓடறான். அவன் எனக்கு வேணும்.",
  "en": "One of them is running. I want him.",
  "mood": "determined",
  "whoTa": "நீ"
 },
 "r4_m3_interrog": {
  "spk": "gang",
  "who": "SCORPION",
  "ta": "அடிக்காத! துப்பாக்கி எல்லாம் வெட்டு வேலுகிட்ட இருந்துதான் வருது. சில்வர் ஹில் குவாரியில!",
  "en": "Don't hit me! The guns all come from Vettu Velu. At the Silver Hill quarry!",
  "mood": "afraid",
  "whoTa": "ஸ்கார்ப்பியன்"
 },
 "r4_m3_records": {
  "spk": "player",
  "who": "YOU",
  "ta": "மில்லோட உற்பத்தி பதிவேடுகள். இது எரிஞ்சிருந்தா எல்லாம் போயிருக்கும்.",
  "en": "The mill's production records. If these had burned, everything would be lost.",
  "mood": "neutral",
  "whoTa": "நீ"
 },
 "r4_m3_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தறி தப்பிச்சுடுச்சு. இப்போ வேலுவோட துப்பாக்கிகளை நிறுத்தணும்.",
  "en": "The looms are safe. Now we must stop Velu's guns.",
  "mood": "warm",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r4_m4_photo": {
  "spk": "player",
  "who": "YOU",
  "ta": "வாங்கறவன், விக்கறவன். இரண்டு பேர் முகமும் கிடைச்சுடுச்சு.",
  "en": "The buyer and the seller. I have both their faces.",
  "mood": "hushed",
  "whoTa": "நீ"
 },
 "r4_m4_gen": {
  "spk": "player",
  "who": "YOU",
  "ta": "ஜெனரேட்டர் போச்சு. அவங்க அங்க போய் பார்ப்பாங்க.",
  "en": "The generator is down. They will go and check it.",
  "mood": "hushed",
  "whoTa": "நீ"
 },
 "r4_m4_velu": {
  "spk": "velu",
  "who": "VETTU VELU",
  "ta": "நீயா? இங்கயே தீர்த்துடுங்கடா அவன!",
  "en": "You? Finish him right here!",
  "mood": "menacing",
  "whoTa": "வெட்டு வேலு"
 },
 "r4_m4_records": {
  "spk": "player",
  "who": "YOU",
  "ta": "பணம் ஒரு கம்பெனி மூலமா போயிருக்கு. அதுக்கு பின்னால ஒரு பெரிய குழுமம் இருக்கு.",
  "en": "The money went through a company. There is a bigger business group behind it.",
  "mood": "grave",
  "whoTa": "நீ"
 },
 "r4_m4_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வேலு முடிஞ்சான். கடைசி சரக்கு சில்வர் லேக் வழியா படகுல வருது.",
  "en": "Velu is finished. Their last shipment comes across Silver Lake by boat.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r4_m5_fisher": {
  "spk": "fisherman",
  "who": "FISHERMAN",
  "ta": "காலைல மூணு மணிக்கு பெட்டிகளை ஏத்தினாங்க. ஜெட்டி கடைசியில நிக்குற வெள்ளை படகு.",
  "en": "They loaded boxes at three in the morning. The white boat at the end of the jetty.",
  "mood": "hushed",
  "whoTa": "மீனவர்"
 },
 "r4_m5_photo": {
  "spk": "player",
  "who": "YOU",
  "ta": "பெட்டிகள ஏத்தறாங்க. போட்டோ கிடைச்சுடுச்சு.",
  "en": "They are loading the boxes. Got the photo.",
  "mood": "hushed",
  "whoTa": "நீ"
 },
 "r4_m5_boat": {
  "spk": "gang",
  "who": "SCORPION",
  "ta": "படகை ஸ்டார்ட் பண்ணு! போ போ!",
  "en": "Start the boat! Go, go!",
  "mood": "urgent",
  "whoTa": "ஸ்கார்ப்பியன்"
 },
 "r4_m5_cargo": {
  "spk": "player",
  "who": "YOU",
  "ta": "துப்பாக்கிகள் மட்டும் இல்ல… இங்க ஆவணங்களும் இருக்கு. ஓல்ட் கோவை மில்ஸ் பத்தி.",
  "en": "Not just guns… there are papers here too. About Old Kovai Mills.",
  "mood": "grave",
  "whoTa": "நீ"
 },
 "r4_m5_sink": {
  "spk": "player",
  "who": "YOU",
  "ta": "அந்த சரக்கு இனி யாருக்கும் போகாது.",
  "en": "That cargo won't reach anyone now.",
  "mood": "determined",
  "whoTa": "நீ"
 },
 "r4_m5_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "துப்பாக்கி இல்ல, பணம் இல்ல. சுந்தரம் ஓல்ட் கோவை மில்ஸ்ல ஒளிஞ்சிருக்கான்.",
  "en": "No guns, no money. Sundaram is hiding in Old Kovai Mills.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r4_m6_kathir": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "லோடிங் பக்கம் காவல் குறைவு. என் பின்னால வா.",
  "en": "The loading side is lightly guarded. Follow me.",
  "mood": "hushed",
  "whoTa": "கதிர்"
 },
 "r4_m6_held": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "தம்பி! எங்கள உள்ள அடைச்சு வச்சிருக்காங்க!",
  "en": "Thambi! They locked us in here!",
  "mood": "afraid",
  "whoTa": "மில் தொழிலாளி"
 },
 "r4_m6_final": {
  "spk": "gang",
  "who": "SCORPION",
  "ta": "எல்லாரும் வாங்கடா! ஒருத்தனும் வெளிய போகக்கூடாது!",
  "en": "Everyone, come! Nobody leaves this place!",
  "mood": "menacing",
  "whoTa": "ஸ்கார்ப்பியன்"
 },
 "r4_m6_sundaram": {
  "spk": "sundaram",
  "who": "SILK SUNDARAM",
  "ta": "என் மில்லுக்குள்ள வந்துட்டியா? இது தான் உன் கடைசி நாள்.",
  "en": "You walked into my mill? This is your last day.",
  "mood": "menacing",
  "whoTa": "சில்க் சுந்தரம்"
 },
 "r4_m6_run": {
  "spk": "sundaram",
  "who": "SILK SUNDARAM",
  "ta": "லாரியை எடு! லோடிங் யார்டுக்கு!",
  "en": "Get the lorry! To the loading yard!",
  "mood": "urgent",
  "whoTa": "சில்க் சுந்தரம்"
 },
 "r4_m6_down": {
  "spk": "sundaram",
  "who": "SILK SUNDARAM",
  "ta": "இந்த ஊரு… எனக்குத்தான் சொந்தமா இருக்கணும்…",
  "en": "This city… was supposed to be mine…",
  "mood": "weak",
  "whoTa": "சில்க் சுந்தரம்"
 },
 "r4_m6_begin": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இது ஒரு ஆரம்பம் தான் தம்பி.",
  "en": "This is only the beginning, son.",
  "mood": "grave",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r5_m7_return": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தம்பி, அங்கிருந்து கிளம்பு! ஸ்கார்ப்பியன்ஸ் ஜீப் ஒண்ணு மில்லுக்குத் திரும்பி வருதுன்னு கதிர் சொல்றான்.",
  "en": "Thambi, get out of there! Kathir says a Scorpion jeep is heading back to the mill.",
  "mood": "urgent",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r5_m8_hotel": {
  "spk": "player",
  "who": "YOU",
  "ta": "ஹோட்டல்ல அவனப் பிடிச்சுட்டேன். சூட் போட்ட ஒருத்தர்கூட கை குலுக்கறான்.",
  "en": "Got him at the hotel. Shaking hands with someone in a suit.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r5_m8_official": {
  "spk": "player",
  "who": "YOU",
  "ta": "இவன் ரவுடி இல்ல. அது அரசாங்க கார். அவன் ஒரு அதிகாரிய சந்திக்கிறான்.",
  "en": "That is no gangster. That is a government car. He is meeting an official.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r5_m8_rec1": {
  "spk": "devarajan",
  "who": "DEVARAJAN",
  "ta": "நில சர்வே அடுத்த மாசம் ரெடியாயிடும். உங்க பங்கு வழக்கமான அக்கவுண்ட்ல இருக்கு.",
  "en": "The land survey will be ready next month. Your share is in the usual account.",
  "mood": "smooth",
  "whoTa": "தேவராஜன்"
 },
 "r5_m8_rec2": {
  "spk": "official",
  "who": "OFFICIAL",
  "ta": "தொழிலாளர்கள் கையெழுத்து போடறத மட்டும் பாத்துக்கோங்க. என் டிபார்ட்மெண்ட் எப்பவும் கண்ண மூடிட்டு இருக்க முடியாது.",
  "en": "Just make sure the workers sign. My department cannot keep looking away.",
  "mood": "nervous",
  "whoTa": "அதிகாரி"
 },
 "r5_m11_proof": {
  "spk": "player",
  "who": "YOU",
  "ta": "தென்றல் பில்டர்ஸ் பேமெண்ட் சீட்டுகள். ஒவ்வொண்ணுலயும் பாஸ்கர் பேரு.",
  "en": "Payment slips from Thendral Builders. With Bhaskar's name on every one.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r5_m11_persuade": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அதைக் கண்டுபிடிச்சுட்டியா… சரி. பணம் வேணாம். நான் உனக்கு உதவறேன். அப்புறமாவது நிம்மதியா தூங்கலாம்.",
  "en": "You found those… All right. No money. I will help you. Maybe then I can sleep again.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "intro_15": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "லேக்வியூ வீட்டுக்கு வா தம்பி. நீ ஒருத்தர பாக்கணும்.",
  "en": "Come to the Lakeview safehouse, thambi. There is someone you must meet.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_16": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "டவர் கேமராக்கள் எல்லாம் கிழக்கு சந்திப்புல இருக்கிற ஒரு ரிலே வழியா ஓடுதுன்னு அர்ஜுன் சொல்றான். சத்தமில்லாம அதை துண்டி.",
  "en": "Arjun says the tower cameras run through a relay in East Junction. Cut it, quietly.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_17": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "ஒவ்வொரு வேலைக்கும் தப்பிக்க ஒரு வழி வேணும். வேகமான ஒரு கார கண்டுபிடிச்சு தயார் பண்ணு.",
  "en": "Every job needs a way out. Find a fast car and get it ready.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_18": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இன்னைக்கு ராத்திரி ராயல் கிராண்ட் ஹோட்டல்ல ஒரு பிசினஸ் விருந்து. தேவராஜனோட ஆள் ஒருத்தன் அங்க வருவான். அவன்கிட்ட நமக்கு வேண்டிய ஒரு கார்டு இருக்கு.",
  "en": "There is a business dinner at the Royal Grand Hotel tonight. One of Devarajan's men will be there, with a card we need.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_19": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "எல்லாம் தயார் தம்பி. இன்னைக்கு ராத்திரி தேவராஜனோட பெட்டகத்த திறக்கறோம்.",
  "en": "Everything is ready, thambi. Tonight we open Devarajan's Vault.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_20": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நம்ம வழி அவங்களுக்கு தெரிஞ்சிருக்கு! எப்படியாவது ஃபைல்கள சென்ட்ரல் கோவையில இருந்து வெளிய கொண்டு போ.",
  "en": "They knew our route! Get the files out of Central Kovai, any way you can.",
  "mood": "urgent",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "intro_21": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "ஃபைல்கள வீட்டுக்கு கொண்டு வா. அதைத் திறக்க அர்ஜுன் காத்திருக்கான்.",
  "en": "Bring the files to the safehouse. Arjun is waiting to open them.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r6_m15_para": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "நம்ம எதிரி யாருன்னு தெரிஞ்சிருச்சு. ஆனா அவனோட உண்மையான முகம் இன்னும் தெரியல.",
  "en": "We know who our enemy is. But we still do not know his real face.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r6_m15_vault": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தேவராஜனோட பெட்டகத்துல எல்லாம் இருக்கு: பணம், பறிச்ச நிலம், பேருங்க, அடுத்த ஆபரேஷன்.",
  "en": "Devarajan's Vault holds everything: the money, the stolen land, the names, and the next operation.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r6_m15_arjun": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "தேவராஜன் மாதிரி ஆளுங்களுக்கு நான் செக்யூரிட்டி சிஸ்டம் கட்டியிருக்கேன். அவங்க எப்படி யோசிப்பாங்கன்னு எனக்கு தெரியும். உன்னை உள்ள கொண்டு போறேன்.",
  "en": "I built security systems for men like Devarajan. I know how they think. I will get you in.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m15_entr": {
  "spk": "player",
  "who": "YOU",
  "ta": "உள்ள போக மூணு வழி: மெயின் கேட், சர்வீஸ் ரேம்ப், லோடிங் பே.",
  "en": "Three ways in: the main gate, the service ramp and the loading bay.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m15_rot": {
  "spk": "player",
  "who": "YOU",
  "ta": "காவலாளிங்க பத்து நிமிஷத்துக்கு ஒரு தடவ மாறுறாங்க. சர்வீஸ் ரேம்ப்ல ஒரு இடைவெளி இருக்கு.",
  "en": "The guards change every ten minutes. There is a gap at the service ramp.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m15_board": {
  "spk": "player",
  "who": "YOU",
  "ta": "பேஸ்மெண்ட் ரெண்டு, தனி வழி. அதுதான் பெட்டகம்.",
  "en": "Basement two, private access. That is the Vault.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m15_end": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "நல்லது. இப்போ எங்கன்னு தெரியும். அடுத்து அவங்க கண்ண மூடணும்.",
  "en": "Good. Now we know where. Next, we blind them.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m16_arjun": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "கண்ட்ரோல் ரூம் அந்த குடிசையில இருக்கு. பேனல்ல இணைச்சுக்கோ, நான் சொல்லித் தரேன்.",
  "en": "The control room is in that hut. Plug in at the panel and I will talk you through it.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m16_hack": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "கோட் வர வர டைப் பண்ணு. உன்னை லாக் பண்றதுக்குள்ள சீக்கிரம்.",
  "en": "Type the codes as they come up. Quickly, before it locks you out.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m16_creds": {
  "spk": "player",
  "who": "YOU",
  "ta": "அக்சஸ் விவரங்கள் கிடைச்சிருச்சு.",
  "en": "Got the access credentials.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m16_backup": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "பேக்கப் சிஸ்டம் எழுந்துடுச்சு. அங்கிருந்து வெளிய போ!",
  "en": "The backup system is waking up. Get out of there!",
  "mood": "urgent",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m16_end": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "அவங்க கேமராக்கள் இப்போ நம்மளோடது. நல்ல வேலை.",
  "en": "Their cameras are ours now. Nice work.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m17_kathir": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நான் உனக்கு கடன்பட்டிருக்கேன் அண்ணா. என் கார எடுத்துக்கோ. அன்னைக்கு ராத்திரி நான் இருப்பேன்.",
  "en": "I owe you, anna. Take my car. On the night, I will be there.",
  "mood": "determined",
  "whoTa": "கதிர்"
 },
 "r6_m17_find": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "வேகமான, உறுதியான ஒண்ணு கண்டுபிடி. அப்புறம் மில் எஸ்டேட்ல இருக்கிற மணி கேரேஜுக்கு கொண்டு போ.",
  "en": "Find something fast and strong. Then take it to Mani's garage in Mill Estate.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r6_m17_mech": {
  "spk": "mechanic",
  "who": "MANI",
  "ta": "குண்டு துளைக்காத கண்ணாடி, பலமான என்ஜின். உன்னை கைவிடாது.",
  "en": "Bulletproof glass, a stronger engine. She will not let you down.",
  "mood": "proud",
  "whoTa": "மணி"
 },
 "r6_m17_end": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "வழி சரியா இருக்கு. இப்போ முன் கதவு வழியா போக ஒரு வழி வேணும்.",
  "en": "The route works. Now we need a way through the front door.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m18_g1": {
  "spk": "guest",
  "who": "GUEST",
  "ta": "தேவராஜனா? ஏலத்துக்கு அப்புறம் யாருமே அவர பாக்கல.",
  "en": "Devarajan? Nobody has seen him since the auction.",
  "mood": "gossip",
  "whoTa": "விருந்தினர்"
 },
 "r6_m18_g2": {
  "spk": "guest",
  "who": "GUEST",
  "ta": "அங்க இருக்கிற பிரகாஷ்கிட்ட கேளுங்க. டவரோட செக்யூரிட்டி காண்ட்ராக்ட் இன்னும் அவர்தான் பாக்கறார்.",
  "en": "Ask Prakash over there. He still runs the tower's security contracts.",
  "mood": "gossip",
  "whoTa": "விருந்தினர்"
 },
 "r6_m18_prak": {
  "spk": "prakash",
  "who": "PRAKASH",
  "ta": "உன்னை யார் உள்ள விட்டது? இது தனிப்பட்ட பார்ட்டி.",
  "en": "Who let you in? This is a private party.",
  "mood": "smooth",
  "whoTa": "பிரகாஷ்"
 },
 "r6_m18_ok": {
  "spk": "prakash",
  "who": "PRAKASH",
  "ta": "சரி. அஞ்சு நிமிஷம், பின்னாடி ஆபீஸ்ல.",
  "en": "Fine. Five minutes, in the back office.",
  "mood": "smooth",
  "whoTa": "பிரகாஷ்"
 },
 "r6_m18_bad": {
  "spk": "prakash",
  "who": "PRAKASH",
  "ta": "செக்யூரிட்டி! இவன வெளிய தூக்கிப் போடுங்க!",
  "en": "Security! Throw this man out!",
  "mood": "shouting",
  "whoTa": "பிரகாஷ்"
 },
 "r6_m18_card": {
  "spk": "player",
  "who": "YOU",
  "ta": "அவனோட அக்சஸ் கார்டு கிடைச்சிருச்சு.",
  "en": "Got his access card.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m18_expose": {
  "spk": "player",
  "who": "YOU",
  "ta": "நீ யாருக்கு வேலை செய்யறன்னு இந்த ஊருக்கே தெரியணும்.",
  "en": "Everyone in this city should know who you work for.",
  "mood": "firm",
  "whoTa": "நீ"
 },
 "r6_m18_free": {
  "spk": "prakash",
  "who": "PRAKASH",
  "ta": "என்னை விட்டுடு, காவலாளிங்க எப்போ மாறுவாங்கன்னு சொல்றேன். சத்தியமா.",
  "en": "Let me go and I will tell you when the guards change. I swear.",
  "mood": "afraid",
  "whoTa": "பிரகாஷ்"
 },
 "r6_m18_end": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "அந்த கார்டு இருந்தா, பெட்டக கதவு நம்மளோடது.",
  "en": "With that card, the Vault door is ours.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m19_arjun": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "நான் அவங்க கேமராவுல இருக்கேன். உள்ள போற வழிய நீயே தேர்ந்தெடு.",
  "en": "I am on their cameras. Choose your way in.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m19_quiet": {
  "spk": "player",
  "who": "YOU",
  "ta": "சர்வீஸ் வழி. யாருக்கும் ஒரு சத்தமும் கேக்கக்கூடாது.",
  "en": "Service entrance. Nobody hears a thing.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m19_loud": {
  "spk": "player",
  "who": "YOU",
  "ta": "முன் கதவு. வரட்டும் அவங்க.",
  "en": "Front door. Let them come.",
  "mood": "determined",
  "whoTa": "நீ"
 },
 "r6_m19_cams": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "அவங்க கேமரா பழைய வீடியோவ ஓட்டிட்டு இருக்கு. அவங்களுக்கு நீ தெரியமாட்ட.",
  "en": "Their cameras are looping old footage. You are invisible to them.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m19_vault": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "அதுதான் பெட்டக கதவு. கார்ட பயன்படுத்து.",
  "en": "That is the Vault door. Use the card.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m19_drill": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "கார்டு இல்லையா? அப்போ டிரில் பண்ணு. சத்தம் வரும்.",
  "en": "No card? Then drill it. It will be loud.",
  "mood": "urgent",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m19_loot": {
  "spk": "player",
  "who": "YOU",
  "ta": "ரெக்கார்டுகள், கணக்கு புத்தகங்கள், பணம். எல்லாம் இங்க இருக்கு.",
  "en": "Records, ledgers, cash. It is all here.",
  "mood": "quiet",
  "whoTa": "நீ"
 },
 "r6_m19_alarm": {
  "spk": "guard",
  "who": "GUARD",
  "ta": "டவருக்குள்ள ஊடுருவல்! கதவுகள மூடுங்க!",
  "en": "Intruders in the tower! Seal the doors!",
  "mood": "shouting",
  "whoTa": "காவலாளி"
 },
 "r6_m20_comp": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "நம்ம வழி அவங்களுக்கு தெரிஞ்சிருக்கு. மெயின் ரோடு அடைச்சிருக்காங்க. ரயில் பாதை வழியா போ!",
  "en": "They knew our route. The main road is blocked. Go by the railway!",
  "mood": "urgent",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m20_kathir": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "பிடிச்சுக்கோ அண்ணா! போலீஸ என் பின்னாடி இழுத்துட்டு போறேன்!",
  "en": "Hold on, anna! I will pull the police after me!",
  "mood": "determined",
  "whoTa": "கதிர்"
 },
 "r6_m20_workers": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "நம்ம தொழிலாளர்கள் உனக்கு பின்னாடி ரோட்ட அடைச்சிருக்காங்க. போ!",
  "en": "Our workers are blocking the road behind you. Go!",
  "mood": "firm",
  "whoTa": "செல்வி அக்கா"
 },
 "r6_m20_bhaskar": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "லேக்வியூ ரோட்டுல இருந்து என் ஆளுங்கள எடுத்துட்டேன். போ.",
  "en": "I have pulled my men off the Lakeview road. Go.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "r6_m20_end": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "தப்பிச்சுட்டோம். ஃபைல்கள் பத்திரமா இருக்கு.",
  "en": "We made it. The files are safe.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m21_arjun": {
  "spk": "arjun",
  "who": "ARJUN VARADHAN",
  "ta": "என்க்ரிப்ஷன் பலமா இருக்கு. ஆனா அவ்வளவு பலமில்ல.",
  "en": "The encryption is strong. But not strong enough.",
  "mood": "calm",
  "whoTa": "அர்ஜுன் வரதன்"
 },
 "r6_m21_call": {
  "spk": "architect",
  "who": "UNKNOWN CALLER",
  "ta": "நீ தப்பான நகரத்த பாத்துட்டு இருக்க.",
  "en": "You have been looking at the wrong city.",
  "mood": "calm",
  "whoTa": "தெரியாத அழைப்பு"
 },
 "r6_m21_para": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "அவன் யாரா இருந்தாலும் தம்பி, நம்மகிட்ட அவன் வேலை இன்னும் முடியல.",
  "en": "Whoever he is, thambi, he is not finished with us.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "r6_locked": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "கொஞ்சம் ஓய்வெடு தம்பி. ஏதோ வருது. நான் கூப்பிடறேன்.",
  "en": "Rest a while, thambi. Something is coming. I will call you.",
  "mood": "serious",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "s_p1_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "இந்த மில்லோட முதல் பத்திரத்துல என் அப்பாவோட கையெழுத்து. நன்றி தம்பி.",
  "en": "My father's signature, on the first deed of this mill. Thank you, thambi.",
  "mood": "emotional",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "s_p2_a": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "பரமசிவம் அண்ணாவா? நைட் ஷிஃப்ட் பாட்டு இன்னும் ஞாபகம் இருக்குன்னு அவர்கிட்ட சொல்லு.",
  "en": "Paramasivam Anna? Tell him I still remember the night shift songs.",
  "mood": "warm",
  "whoTa": "மில் தொழிலாளி"
 },
 "s_p2_b": {
  "spk": "worker_f",
  "who": "MILL WORKER",
  "ta": "என் பையன் இப்போ இன்ஜினியர்னு அண்ணாகிட்ட சொல்லு. அவன் படிப்புக்கு மில்தான் காசு கொடுத்தது.",
  "en": "Tell Anna my son is an engineer now. The mill paid for his school.",
  "mood": "warm",
  "whoTa": "மில் தொழிலாளி"
 },
 "s_p2_c": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "நாங்க எப்பவும் அவர் கூட இருக்கோம்னு சொல்லு.",
  "en": "Tell him we are with him. Always.",
  "mood": "warm",
  "whoTa": "மில் தொழிலாளி"
 },
 "s_p2_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "அவங்களுக்கு ஞாபகம் இருக்கு. ஒரு கிழவனுக்கு அது போதும்.",
  "en": "They remember. That is enough for an old man.",
  "mood": "emotional",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "s_p3_end": {
  "spk": "paramasivam",
  "who": "PARAMASIVAM",
  "ta": "தொழிலாளர்கள் எல்லாரும் சேர்ந்து, செங்கல் செங்கலா இந்த மில்ல கட்டினாங்க. அந்த கதைய யாராலும் விக்க முடியாது.",
  "en": "The workers built this mill together, brick by brick. Nobody can sell that story.",
  "mood": "emotional",
  "whoTa": "பரமசிவம் அண்ணா"
 },
 "s_k1_a": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "அப்பாவோட கடனுக்கு மறுபடியும் வந்துட்டாங்க. அஞ்சு மடங்கு வட்டி அண்ணா.",
  "en": "They came again for my father's loan. Five times the interest, anna.",
  "mood": "afraid",
  "whoTa": "கதிர்"
 },
 "s_k1_end": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "இனிமே அவங்க வரமாட்டாங்க. நன்றி அண்ணா.",
  "en": "They will not come back. Thank you, anna.",
  "mood": "relieved",
  "whoTa": "கதிர்"
 },
 "s_k2_a": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "காலேஜ்ல இருந்து காவ்யாவோட ஆட்டோ பின்னாடியே ஒரு கார் வருது. ப்ளீஸ் அண்ணா!",
  "en": "A car has been behind Kavya's auto since the college. Please, anna!",
  "mood": "urgent",
  "whoTa": "கதிர்"
 },
 "s_k2_end": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "அவ பத்திரமா இருக்கா. உனக்கு எப்படி திருப்பி செய்யறதுன்னே தெரியல.",
  "en": "She is safe. I do not know how to repay you.",
  "mood": "relieved",
  "whoTa": "கதிர்"
 },
 "s_k3_a": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "ஒரே ஒரு ரேஸ் அண்ணா. அண்ணன் தம்பி மாதிரி. தோத்தவன் டீ வாங்கணும்!",
  "en": "One race, anna. Like brothers. Loser buys the tea!",
  "mood": "playful",
  "whoTa": "கதிர்"
 },
 "s_k3_end": {
  "spk": "kathir",
  "who": "KATHIR",
  "ta": "நீ ஜெயிச்சுட்ட. இன்னையில இருந்து நீ என் அண்ணன்.",
  "en": "You won. From today, you are my brother.",
  "mood": "warm",
  "whoTa": "கதிர்"
 },
 "s_s1_end": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "தென்றல் பில்டர்ஸால இந்த குடும்பங்க வீட்ட இழந்தாங்க. இன்னைக்கு உன்னாலதான் சாப்பிடறாங்க.",
  "en": "These families lost their homes to Thendral Builders. Today they eat because of you.",
  "mood": "warm",
  "whoTa": "செல்வி அக்கா"
 },
 "s_s2_a": {
  "spk": "gang",
  "who": "CONTRACTOR",
  "ta": "சம்பளமா? காசு இல்ல. போ இங்கிருந்து!",
  "en": "Wages? There is no money. Get lost!",
  "mood": "threatening",
  "whoTa": "காண்ட்ராக்டர்"
 },
 "s_s2_end": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "ஆறு மாச சம்பளம், சேர வேண்டிய இடத்துக்கு வந்துருச்சு.",
  "en": "Six months of wages, back where they belong.",
  "mood": "firm",
  "whoTa": "செல்வி அக்கா"
 },
 "s_s3_end": {
  "spk": "selvi",
  "who": "SELVI AKKA",
  "ta": "ஒவ்வொரு பக்கத்துலயும் போலி கையெழுத்து. இப்போ கோர்ட் அதைப் பாக்கும்.",
  "en": "Forged signatures on every page. Now the court will see them.",
  "mood": "firm",
  "whoTa": "செல்வி அக்கா"
 },
 "s_b1_a": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "சப் இன்ஸ்பெக்டர் ரகு தேவராஜன் ஆளுங்ககிட்ட பணம் வாங்கறான். அவன் ஜீப்ப பின்தொடர். சத்தமில்லாம.",
  "en": "Sub-inspector Raghu takes money from Devarajan's people. Follow his jeep. Quietly.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "s_b1_end": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அப்போ அது உண்மைதான். ரகுவ நான் என் வழியில பாத்துக்கறேன்.",
  "en": "So it is true. I will deal with Raghu my way.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "s_b2_a": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "மில் தீ வழக்கோட ஆதாரம் நம்ம யார்டுல இருந்தே காணாம போயிடுச்சு. அதை எரிக்கறதுக்குள்ள திரும்ப எடு.",
  "en": "The evidence from the mill fire went missing from our own yard. Get it back before it is burned.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "s_b2_end": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "இது இருந்தா, மில் தீ வழக்கு மறுபடியும் திறக்கும்.",
  "en": "With this, the mill fire case opens again.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "s_b3_a": {
  "spk": "worker",
  "who": "MILL WORKER",
  "ta": "நான் வாய் திறந்தது அவங்களுக்கு தெரிஞ்சிருச்சு. இன்னைக்கு ராத்திரி என்னைத் தேடி வருவாங்க.",
  "en": "They know I talked. They are coming for me tonight.",
  "mood": "afraid",
  "whoTa": "மில் தொழிலாளி"
 },
 "s_b3_protect": {
  "spk": "player",
  "who": "YOU",
  "ta": "இவன யாரும் தொடக்கூடாது. என் பின்னாடி நில்லு.",
  "en": "Nobody touches him. Stay behind me.",
  "mood": "determined",
  "whoTa": "நீ"
 },
 "s_b3_hand": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அவன ஒரு பத்திரமான செல்லுல வைக்கறேன். அவன் சாட்சி சொல்லுவான்.",
  "en": "I will keep him in a safe cell. He will testify.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 },
 "s_b3_end": {
  "spk": "bhaskar",
  "who": "INSPECTOR BHASKAR",
  "ta": "அவனுக்கு நீ சரியானதைச் செஞ்ச. எல்லாரும் அப்படி செய்ய மாட்டாங்க.",
  "en": "You did right by him. Not many would.",
  "mood": "tired",
  "whoTa": "இன்ஸ்பெக்டர் பாஸ்கர்"
 }
};
