# Kovai Streets: Story and Activities

This document covers all the content in **Kovai Streets**: the full storyline, every side activity, how progress and unlocks work, and a checklist for finishing everything. It is based on the game code in `index.html`, so the numbers here (rewards, timers, enemy counts) are the real values the game uses.

> **Spoiler warning:** this file gives away the whole story, the boss fights and the locations of every hidden item.

---

## Contents

1. [Setting](#1-setting)
2. [Main characters](#2-main-characters)
3. [The full storyline](#3-the-full-storyline)
   - [Act 2: Threads of Kovai](#3b-act-2-threads-of-kovai-story-missions-714)
4. [Jobs (repeatable missions)](#4-jobs-repeatable-missions)
5. [Rampages](#5-rampages)
6. [Stunt jumps](#6-stunt-jumps)
7. [Hidden film reels](#7-hidden-film-reels)
8. [Friends: Meena and Divya](#8-friends-meena-and-divya)
9. [People, tea stalls, the hospital and the gun shop](#9-people-tea-stalls-the-hospital-and-the-gun-shop)
10. [The safehouse and garage](#10-the-safehouse-and-garage)
11. [Gangs, police and wanted levels](#11-gangs-police-and-wanted-levels)
12. [Free-roam activities](#12-free-roam-activities)
13. [Progression: Respect, unlocks and saving](#13-progression-respect-unlocks-and-saving)
14. [The tutorial](#14-the-tutorial)
15. [100% completion checklist](#15-100-completion-checklist)
16. [Notes and known quirks](#16-notes-and-known-quirks)

---

## 1. Setting

The game is set in a stylised version of **Coimbatore (Kovai)**, Tamil Nadu. The city is a 10 × 10 grid of blocks with real neighbourhood names: Gandhipuram, R.S. Puram, Town Hall, Race Course, Peelamedu, Ukkadam, Singanallur, Saibaba Colony, Saravanampatti and Podanur. Around the city are three larger areas:

- **The foothills** (Marudhamalai and Velliangiri): the temple and the hill statue.
- **The Western Ghats** (west): a winding ghat road, a hill village, a waterfall and a hilltop viewpoint. *Locked at the start.*
- **Kovai Coast** (east): a made-up beach, a jetty, boats and a lighthouse. Coimbatore has no real coastline. *Locked at the start.*

The game's central theme is Kovai's **textile mills**. Its story is about a gang trying to take them over.

---

## 2. Main characters

| Character | Who they are | Where to find them |
|---|---|---|
| **You** | A newcomer in Kovai looking to make a name for yourself | You start in Gandhipuram beside a red car |
| **Paramasivam Anna** | A retired mill foreman who ran the looms at Podanur for thirty years. Gives you every story mission. Wears a white veshti and glasses | The mills in Peelamedu. Gold **S** on the map and a gold light beam |
| **Kathir** | Paramasivam's nephew, who helps the workers | Appears in story missions 2 and 3 |
| **Silk Sundaram** | Boss of the **Black Scorpions** gang, who wants control of Kovai's mills. Final boss | The old Kovai Mills (story mission 6) |
| **Vettu Velu** | Sundaram's right-hand man, who handles the gang's gun deals | The hilltop viewpoint in the Ghats (story mission 4) |
| **The Black Scorpions** | The rival gang. Dark clothes, black headbands, pistols, SMGs and rifles | Story mission locations |
| **Meena** | College student who loves fast cars. A friend you can hang out with | Race Course (pink heart on the map) |
| **Divya** | Software engineer at the IT park. A friend you can hang out with | The IT park in Peelamedu (pink heart on the map) |
| **Street gang bosses** | Kaala Kumar, Bullet Babu, Scrap Selvam, Mill Mani and Tiger Thangam. Named targets in "Gang boss" jobs | Random job locations |

---

## 3. The full storyline

### "Kovai's Mills": the Black Scorpions story

**Summary:** the Black Scorpions are squeezing Kovai's mill workers for "protection" money. Paramasivam Anna, an old foreman, asks you for help. You drive the gang out of the mills, steal back the workers' money, defend the looms, cut off the gang's weapons supply in the Ghats and at sea, and finally storm the old Kovai Mills to take down Silk Sundaram.

**How it works**
- Talk to Paramasivam (**T** on keyboard, **TALK** on touch) to read the mission brief and start it.
- Missions must be played in order. After each one, go back to Paramasivam for the next.
- Each mission pays cash and **+2 Respect**.
- If you fail (timer runs out, the target escapes or you get knocked out), the mission ends. Talk to Paramasivam again to retry.
- Mission progress is not saved partway through. Finished missions are saved.

**Total story rewards:** ₹45,000 cash, +12 Respect, full armour at the end, and access to the Western Ghats and Kovai Coast.

---

### Mission 1: Smoke Over the Mills (₹2,000)

**Brief (Paramasivam):** *"Vanakkam, thambi. I ran the looms at Podanur for thirty years. Now the Black Scorpions squeeze my workers for money every week. Will you help?"*

1. Paramasivam: *"Go to the Podanur mill and chase those Scorpions out!"*
2. **Clear the Black Scorpions out of the mill.** 5 gang members wait between the mill sheds. They don't attack until you get within about 36 m. A marker guides you until you're close.
3. Paramasivam: *"Nandri! But they answer to someone bigger: Silk Sundaram."*

**Outcome:** you learn who is behind the gang.

---

### Mission 2: The Courier (₹3,000)

**Brief:** *"Sundaram sends a courier around in a black SUV to collect his 'protection' money. Today is collection day."*

1. Paramasivam: *"The courier is near the mills right now. Stop that black SUV!"*
2. **Wreck or steal the black courier SUV.** It drives recklessly and tries to get away from you. It is armoured (900 health, more than double a normal car).
   - **Time limit:** 2 minutes 30 seconds.
   - **Fails if:** the SUV gets more than about 420 m away ("They got away").
   - Getting into the SUV yourself also counts as success.
3. Kathir: *"I'm Kathir, Anna's nephew. The workers got their money back. Sundaram will be furious."*

**Outcome:** the workers get their money back, and Sundaram wants revenge.

---

### Mission 3: Burning Looms (₹4,000)

**Brief:** *"Kathir was right. The Scorpions are attacking the Singanallur mill to teach us a lesson!"*

1. Kathir: *"They're torching the looms! Get to the Singanallur mill, fast!"*
2. **Defend the Singanallur mill.** 5 attackers are already aggressive and come at you from up to 75 m away. When they're down, **a second wave of 5** arrives ("MORE OF THEM!").
   - **Time limit:** 4 minutes for both waves.
3. Paramasivam: *"The looms are safe. Sundaram's man Vettu Velu buys guns up in the Ghats. I had the forest checkpoint opened for you."*

**Outcome:** **the Western Ghats unlock** (a "NEW AREA OPEN" message appears if they weren't already open).

---

### Mission 4: Ghat Road Deal (₹5,000)

**Brief:** *"Vettu Velu is meeting gun runners at the hilltop viewpoint. Without those guns, Sundaram is weak."*

1. **Drive up the ghat road to the hilltop viewpoint.** It's a long hairpin climb from the west edge of the city. A jeep is parked at the top if you need a ride back.
2. **Boss: Vettu Velu**, "Sundaram's right-hand man". He wears a gold shirt, carries a rifle and has **900 health**, guarded by **4 Scorpions** with SMGs and rifles.
3. Paramasivam: *"Velu is finished! Their last guns come by sea. The coast road is open to you now."*

**Outcome:** **Kovai Coast unlocks.** Like every boss, Velu drops a rocket launcher and a large cash bundle (₹1,500–2,500).

---

### Mission 5: The Jetty Shipment (₹6,000)

**Brief:** *"Sundaram's last shipment arrives by speedboat at the jetty on Kovai Coast. Stop it."*

1. **Go to the jetty on Kovai Coast.**
2. **Take out the smugglers on the jetty:** 4 armed gang members spread along the wooden pier.
3. **Sink the smugglers' speedboat.** It circles in deep water off the end of the jetty and has 600 health. Either:
   - shoot it from the end of the jetty (a sniper rifle or rocket launcher helps), or
   - take one of the speedboats moored at the jetty and chase it. Climbing aboard the target boat also counts.
   - **Fails if** you move more than about 700 m away.
4. Paramasivam: *"No guns, no money. Sundaram is hiding in the old Kovai Mills. Finish this, thambi."*

**Outcome:** the gang has no weapons supply left.

---

### Mission 6: Silk Sundaram (₹25,000), the finale

**Brief:** *"This is it. Sundaram and every Scorpion left are holed up in the old Kovai Mills. End it tonight."*

1. **Storm the old Kovai Mills** (the mill block in Peelamedu, next to Paramasivam). 6 gang members hold the mill, then **a second wave of 6** arrives.
2. **Final boss: Silk Sundaram**, "Boss of the Black Scorpions". Gold shirt, rifle, **2,200 health** (more than twice Vettu Velu), guarded by 3 more Scorpions.
3. Silk Sundaram: *"This city… was supposed to be mine…"*

**Ending:** "MISSION PASSED", then **"KOVAI IS FREE: You beat the Black Scorpions. Story complete!"** You get ₹25,000, full armour and +2 Respect.

**After Act 1,** Paramasivam's gold beam stays on the map: Act 2 starts with him.

---

## 3b. Act 2: Threads of Kovai (story missions 7–14)

> **"You thought you were fighting a gang. You were fighting a system."**

**Summary:** Silk Sundaram was never the real power. A respected industrialist, **R. Devarajan**, funded the Black Scorpions to frighten mill workers and force through land sales to **Thendral Builders**. Behind him is someone known only as **"A"**, *The Architect*, whose face, name and position are never revealed. Act 2 ends Devarajan's operation and the illegal mill auction. The conspiracy stays alive, and The Architect knows who you are.

**New characters:**
- **R. Devarajan:** the visible villain. White veshti, gold chain.
- **Selvi Akka:** the mill workers' union leader, an active ally in the investigation.
- **Inspector Bhaskar:** an uncertain ally. Your choice decides his role.
- **Kathir:** returns from Act 1. He has been leaking information because his sister was threatened.
- **Malai Rajan:** leader of the Ghat Wolves, a smuggling gang from the hills.
- **Kanal Kannan:** Devarajan's enforcer.

**How it works:**
- All missions start from Paramasivam Anna (gold **S**). Each gives cash and **+2 Respect**.
- Dialogue appears as subtitles, in Tamil with English underneath for the Tamil lines.
- Choices and story flags are saved.
- If a mission fails, talk to Paramasivam to retry. No choice blocks the story: every path reaches the finale.

| # | Mission | Type | What you do | Reward |
|---|---|---|---|---|
| 7 | **Ashes and Ledgers** | Investigation | Search the burned Singanallur mill for a **ledger**, **Sundaram's phone** and a **land agreement**. Gang members patrol with vision cones: avoid them or fight. *Optional:* a visitor pass from the night of the fire hints at an insider. The phone shows a contact saved only as **"A"** | ₹5,000 |
| 8 | **The Tail** | Driving / surveillance | Follow Devarajan's white SUV from Gandhipuram, past a Race Course hotel and a Peelamedu office (where he takes a phone call), to a quiet meeting. Stay **20–75 m** behind: too close raises a **suspicion meter**, too far loses him. Stop and hold steady to **photograph the meeting**. *Optional:* get close to the second car to capture its registration number | ₹7,500 |
| 9 | **Workers' Voice** | Escort / protection | Pick up **Selvi Akka** at the Podanur mill gate and get her to the workers' rally at Town Hall (she rides pillion or in your car). Fight off six attackers while keeping her **health bar** above zero. *Optional:* free **3 trapped workers** (+₹2,500, Selvi trust) | ₹10,000 |
| 10 | **Night at the Godown** | Stealth | At night, infiltrate the Thendral Builders godown south of Ukkadam. Disable the security panel, which turns the cameras off, then photograph 3 documents and get out. Guards patrol with **vision cones**, so crouch to stay hidden and use the rear door. Melee on an unaware guard is a **silent takedown**. Being spotted raises the alarm (guards attack, reinforcements arrive) but the mission continues. *Bonus:* no alarm (+₹3,000). The documents reveal **PROJECT KOVAI · AUTHORIZED BY: A** | ₹12,500 |
| 11 | **The Inspector's Price** | Dialogue choice | Meet Inspector Bhaskar at the new **Kovai Central Police Station** on the north road. Choose: **pay ₹10,000** (ally), **threaten him with the evidence** (coerced) or **walk away** (neutral) | ₹3,000 |
| 12 | **Kathir's Secret** | Chase + choice | Watch the Gandhipuram bus stand, chase the leaking scooter rider and corner him. It's Kathir. Choose: **forgive him** (₹4,000, he helps in the finale) or **hand him to the police** (₹8,000, the police ease off for 10 minutes, Paramasivam is hurt) | choice |
| 13 | **Ghat Wolves** | Rescue | Selvi has been kidnapped and taken to the hill village on the ghat road. Free her within **4 minutes**, quietly or by force, then escape **250 m** with her alive. *Optional:* beat leader **Malai Rajan** until he **surrenders** and capture him alive (+₹3,000, Selvi trust). You learn about **Devarajan's Vault** | ₹15,000 |
| 14 | **The Auction** (finale) | Multi-stage | (1) Go to Kovai Central mall with Selvi and interrupt the auction. (2) Defeat enforcer **Kanal Kannan** and his guards. (3) Chase Devarajan's SUV across the city, over the flyover, to the coast. (4) Stop him on the jetty before he reaches his boat, or disable the boat. Then the confrontation, a phone call from an altered voice: *"Project Kovai is compromised. Close the operation."*, and a fade to black | ₹25,000 |

### How your choices change Act 2

| Choice | During free roam | In the finale |
|---|---|---|
| Bhaskar **ally** (paid) | Wanted stars fade faster. The helicopter only comes at 5 stars | His men hold two guards outside (3 guards inside) |
| Bhaskar **coerced** (threatened) | Normal police | He shares intel (4 guards), but may betray you: 50% chance of 2 stars during the chase |
| Bhaskar **neutral** (walked away) | Stars fade more slowly | All 5 guards, and the police join in (2 stars during the chase) |
| Kathir **forgiven** | — | Kathir leaves you a fast car outside the mall |
| Kathir **handed over** | Police ease off for 10 minutes | No help from Kathir |
| Selvi trust **2+** (bonus objectives in missions 9 and 13) | — | Workers attend as witnesses: **Devarajan's reputation is finished**. Otherwise his public name survives |

### The open ending: The Architect's message

After the finale, go back to your safehouse (or just keep playing for a while if you don't own it). Then:
1. An encrypted message arrives: *"You have been busy. You removed a few pieces from the board. Silk Sundaram. Devarajan. The mills. Interesting. But you still don't understand the game. Coimbatore is only one part of the plan. We should meet someday. — A"*
2. A second message: *"I know where you live."*
3. A CCTV camera view of your safehouse, which cuts to **NO SIGNAL**.
4. **ACT 2 COMPLETE:** *"The city was never the target. It was the testing ground."*

Free roam continues. Two black SUVs stay parked across the road from your safehouse. Paramasivam has new lines about **the Vault**, Act 3's starting point.

**Total Act 2 rewards:** ₹82,000 (₹86,000 if you hand Kathir over), up to ₹8,500 more from bonus objectives, minus ₹10,000 if you pay Bhaskar. +16 Respect.

---

## 4. Jobs (repeatable missions)

Up to **3 job offers** are on the map at a time. Each is a coloured light beam in the city with a matching lettered circle on the minimap. Drive or walk into a beam to start. Jobs pay cash and **+1 Respect**. Rewards grow by **8% for every job you've finished**.

| Letter | Colour | Job | Unlocks | What you do | Base reward |
|---|---|---|---|---|---|
| **D** | Yellow | **Delivery** | Start | Rush goods across town before the timer runs out. Goods include wet-grinder parts, cotton yarn bales, pump-set motors, handloom silk sarees, jasmine garlands for a wedding, filter-coffee powder, hot biryani parcels and Siruvani water cans | About ₹4 per metre + ₹600 |
| **R** | Cyan | **Street race** | Start | Hit 7 checkpoints at city intersections against the clock | ₹2,000 |
| **F** | Green | **Passenger fare** | Start (needs a vehicle) | Drive a named passenger to their district | About ₹2.5 per metre + ₹300 |
| **+** | White | **Emergency run** | Start (needs a vehicle) | Rush an injured person to the Government Hospital | ₹1,500 |
| **G** | Red | **Gang clean-up** | Respect LV 2 | Take out 6 aggressive goons | ₹2,500 |
| **C** | Orange | **Getaway chase** | Respect LV 2 | Wreck a fleeing black car within 2:30 before it escapes | ₹3,500 |
| **B** | Purple | **Gang boss** | Respect LV 3 | Take down a named boss (Kaala Kumar, Bullet Babu, Scrap Selvam, Mill Mani or Tiger Thangam) in a white shirt, plus 4 guards | ₹6,000 |

You can also start a **passenger fare** by talking to any passer-by and offering them a lift, if you have a vehicle nearby.

---

## 5. Rampages

Four **skull icons** sit in the city. Walk into one on foot to start. You get the rampage weapon with ammo, and 6 hostile goons spawn nearby. **Take out the target number of people or goons in 60 seconds.**

| Rampage | Location | Weapon given | Target | Reward (first / repeat) |
|---|---|---|---|---|
| Rocket rampage | Gandhipuram bus stand | Rocket launcher (+30 rockets) | 15 | ₹2,500 / ₹500 |
| SMG rampage | Beside Town Hall | SMG (+300 rounds) | 20 | ₹2,500 / ₹500 |
| Cricket bat rampage | R.S. Puram | Cricket bat | 10 | ₹2,500 / ₹500 |
| Grenade rampage | Peelamedu, by the IT tower | Grenades (+25) | 12 | ₹2,500 / ₹500 |

You keep the weapon afterwards. Each skull disappears for 30 seconds after a pass or fail. Rampages raise your wanted level, so expect police.

---

## 6. Stunt jumps

Five **yellow ramps** with black edges sit on open roads outside the city where there's no traffic. Hit one at speed (over about 36 km/h) to launch. The game goes into **slow motion** while you're in the air.

| # | Location |
|---|---|
| 1 | East main road, beyond the city towards the coast road |
| 2 | West main road, towards the Ghats forest checkpoint |
| 3 | North road, past Saravanampatti |
| 4 | South road, past the railway line |
| 5 | Kovai Coast beach, running along the sand *(needs the coast unlocked)* |

- **Counts as a stunt jump:** at least 0.8 s in the air and more than 14 m travelled. The game shows the distance and air time.
- **Rewards:** ₹1,000 the first time for each ramp ("UNIQUE STUNT JUMP!"), ₹150 for repeats, and a **₹10,000 bonus** for all 5.
- A short, slow jump gives "Weak jump. Hit the ramp faster!"

---

## 7. Hidden film reels

**20 gold film reels**, "lost reels from an old Kovai cinema", spin slowly at landmarks. Walk or drive through one to collect it. Each pays **₹250**, and finding all 20 pays a **₹25,000 bonus**. They don't appear on the map.

| # | Where | Notes |
|---|---|---|
| 1 | Kovai Central mall, top floor (cinema level) | Take both escalator ramps |
| 2 | Kovai Central mall, first floor food court | |
| 3 | Kovai Junction station platform | |
| 4 | On top of the Avinashi Road flyover | |
| 5 | Inside the temple's inner shrine | Marudhamalai foothills |
| 6 | Behind the Town Hall clock tower | |
| 7 | On the Race Course walking track | |
| 8 | In front of the hill statue | Velliangiri foothills |
| 9 | Hilltop viewpoint, by the small shrine | *Needs the Ghats unlocked* |
| 10 | The waterfall on the ghat road | *Needs the Ghats unlocked* |
| 11 | Base of the lighthouse | *Needs the coast unlocked* |
| 12 | End of the jetty | *Needs the coast unlocked* |
| 13 | Beside the beach lifeguard tower | *Needs the coast unlocked* |
| 14 | Centre of the Kovai Stadium field | |
| 15 | College campus courtyard | |
| 16 | Between the stalls at Kovai Market | |
| 17 | Behind the Government Hospital | |
| 18 | By the R.S. Puram park monument | |
| 19 | Steps of Singanallur lake | |
| 20 | Under the Avinashi Road flyover | Watch the traffic |

---

## 8. Friends: Meena and Divya

| | Meena | Divya |
|---|---|---|
| Who | College student, loves fast cars | Software engineer at the IT park |
| Home | Race Course | IT park, Peelamedu |
| Starting friendship | 20% | 10% |
| 100% reward | Gives you her **Kovai Racer** sports car | **Free armour vest** every time you ask |

**What you can do (press T near them):**
- **Let's hang out:** she picks a place at least 150 m from her home, such as the beach, lighthouse, jetty, hilltop viewpoint, waterfall, temple gate, lakes, Town Hall clock tower, bus stand, R.S. Puram park, Kovai Market, college, stadium, station, mall or hill statue. Places in locked areas aren't picked. Take her there for **+12 friendship**.
- **Gift jasmine flowers (₹100):** +6 friendship, once every 45 seconds.
- **Watch my back** (30%+ friendship): she follows you with a pistol and shoots gang members and police.
- **Head home:** sends her back.
- Hitting a friend with your car costs friendship.

Milestones show on screen: **"TRUSTS YOU"** at 30% and **"BEST FRIENDS!"** at 100%. Friendship is saved.

---

## 9. People, tea stalls, the hospital and the gun shop

### Passers-by
Talk to anyone (T):
- **Say vanakkam:** local chat ("Have you eaten?", "Try the parotta near the bus stand", "My uncle worked in the mills for thirty years"…).
- **Offer a paid lift:** starts a passenger fare job.
- **Buy them a filter coffee (₹20).**
- **Ask for news:** they point you to the nearest gang hangout or a job offer.

People wear sarees, salwar kameez, kurtas, jeans, veshtis and lungis. They carry umbrellas in the rain and run when there's trouble. People refuse to talk if you have 2+ stars, and some fight back if you hit them.

### Tea stalls (10 street corners + the hilltop)
| Item | Price | Effect |
|---|---|---|
| Tea | ₹10 | +20 health |
| Medu vadai | ₹15 | +30 health |
| Bun butter jam | ₹30 | Full health |

### Government Hospital
Stand on the **red ring** to heal fast for free. If you get knocked out, you wake up here and pay a bill of up to ₹500. A tip is shown while you wait.

### Kovai Arms Depot (gun shop)
Stand on the **blue ring** and press 1–0 to buy.

| Item | Price | Unlocks |
|---|---|---|
| Cricket bat | ₹300 | Start |
| Knife | ₹250 | Start |
| Revolver (+36) | ₹2,000 | Start |
| SMG (+96) | ₹1,500 | Start |
| Body armour | ₹800 | Start |
| Shotgun (+32) | ₹2,500 | Respect LV 2 |
| Grenades (×5) | ₹1,500 | Respect LV 2 |
| Assault rifle (+120) | ₹4,000 | Respect LV 3 |
| Sniper rifle (+20) | ₹6,000 | Respect LV 3 |
| Rocket launcher (+6) | ₹9,000 | Respect LV 4 |

The minigun is only available through the `NUTTERTOOLS` cheat.

---

## 10. The safehouse and garage

A pink house with a red-roofed garage on **Perur Road**, just west of the city on the main road (green house icon on the map). Stand on the **green ring** at the front door and press T.

- **Price:** ₹5,000.
- **Once you own it:**
  - **Save the game.**
  - **Change outfit.** Six outfits: teal shirt & jeans, white veshti, checked lungi, black tee & cargos, Kovai cricket jersey, and office formals.
  - **Sleep until morning:** the clock jumps to 7:00, you're fully healed and your wanted level is cleared.
  - **Garage:** up to **3 vehicles** parked inside are saved and are waiting there next time.
  - You **start at the safehouse** when you load a saved game.

---

## 11. Gangs, police and wanted levels

### Street gangs
Seven gang hangouts around the city each hold a group of 4 armed goons. Get close and they attack. Defeated goons drop cash and sometimes their weapon. A cleared hangout fills up again about 100 seconds after you leave the area.

### Wanted level (up to 5 stars)
| You do this | Stars |
|---|---|
| Kill a passer-by | +1 |
| Kill a police officer | +1 |
| Destroy a police car | +1 |
| Ram a police car hard | +1 |
| Steal a police car | +2 |
| Shoot down the police helicopter | +1 |

| Stars | Police response |
|---|---|
| 1+ | Police cars chase and shoot. **Officers get out on foot** when their car stops near you |
| 3+ | **Roadblocks:** two police cars parked across the road ahead of you while you drive, with officers behind them |
| 4+ | **Police helicopter** circles overhead and shoots. A searchlight shines at night. Rockets or heavy fire bring it down |
| 5 | Helicopter fires faster and harder |

**Losing the police:** stay out of sight of police cars (about 75 m) and the stars drop one at a time. You can also sleep at the safehouse or use the `LEAVEMEALONE` / `COOLDOWN` cheats. Officers on foot go home once the heat is off.

---

## 12. Free-roam activities

- **18 drivable vehicles:** sedan, hatchback, SUV, jeep, van, taxi, police car, Kovai Racer, auto-rickshaw, turbo auto, bus, lorry, mini truck, ambulance, motorbike, cruiser, sports bike, scooter, retro scooter, moped and bicycle. There's also a tank (cheat).
- **Boats:** speedboats and fishing boats at the jetty, and a rowboat on Ukkadam lake.
- **Car radio:** three original stations. Kovai FM 91.4 (Carnatic fusion), Coast Beats 98.3 (dance) and Ghat Lo-fi 102.7 (chill). Change with **N** or **RADIO**.
- **Visible car damage:** dents, smashed windows and flat tyres that pull the car to one side. Cars smoke, catch fire and explode.
- **Combat:** fists combo (jab, jab, kick), 12 weapons, a weapon wheel that slows time, lock-on aiming, crouching behind cover, vaulting onto low walls, and people who fly and tumble when hit.
- **Exploring:** a mall you can walk through, the market, the stadium, the college, the temple, the train (it stops at Kovai Junction, and the crossing gates drop), swimming in the lakes and sea, and the waterfall.
- **Day, night and monsoon rain:** one in-game day lasts about 16 real minutes. Rain comes and goes with thunder and lightning.
- **Cheats:** 14 codes (weapons, cash, health, tank, turbo auto, time of day, rain, no vehicle damage, clear wanted level). Press Enter, or pick one in the pause menu.

---

## 13. Progression: Respect, unlocks and saving

**Respect level = 1 + (Respect ÷ 3).** Each finished job gives +1 Respect and each story mission gives +2. Rampages, stunts and reels pay cash only.

| Respect level | Unlocks |
|---|---|
| LV 1 | Delivery, street race, passenger fare and emergency run jobs. Bat, knife, revolver, SMG and armour at the shop |
| LV 2 | Gang clean-up and getaway chase jobs. Shotgun and grenades. **The Western Ghats** |
| LV 3 | Gang boss jobs. Assault rifle and sniper rifle. **Kovai Coast** |
| LV 4 | Rocket launcher at the shop |

The **Western Ghats** also open after story mission 3, and **Kovai Coast** after story mission 4, whatever your Respect level. Before then, a checkpoint barrier blocks the way.

**Saving** is automatic: every 30 seconds, after jobs, purchases and collectibles, and when you pause or close the page. It's stored in the browser on your device. Saved: cash, weapons and ammo, armour, Respect, friendships, story progress, reels, jumps, rampages, the safehouse, garage cars, your outfit and the time of day. The start screen then offers **Continue** or **New game**. The pause menu shows a progress summary and has **Save now** and **Delete save**.

---

## 14. The tutorial

New players get a 7-step tutorial at the bottom of the screen. Each step ticks off when you do it:

1. Walk around (W A S D).
2. Look around with the mouse.
3. Walk to the red car and press E to get in.
4. Drive (W, steer with A / D, Space to drift).
5. Open and close the city map (M).
6. Drive into a coloured job beam (or wait about 25 seconds).
7. Visit Paramasivam Anna for the story.

It can be skipped or restarted from the pause menu. Tips also show on the loading screen and when you're knocked out.

---

## 15. 100% completion checklist

| Goal | Count | Total reward |
|---|---|---|
| Story missions | 6 | ₹45,000 + full armour |
| Film reels | 20 | ₹5,000 + ₹25,000 bonus |
| Unique stunt jumps | 5 | ₹5,000 + ₹10,000 bonus |
| Rampages (first pass) | 4 | ₹10,000 |
| Safehouse bought | 1 | Save point, garage, outfits |
| Meena at 100% friendship | 1 | Kovai Racer sports car |
| Divya at 100% friendship | 1 | Free armour on request |
| Respect LV 4 | — | Every shop item and job type |
| Both areas unlocked | 2 | Western Ghats, Kovai Coast |

The pause menu tracks story, reels, jumps, rampages, Respect level and the safehouse.

---

## 16. Notes and known quirks

- **Mill names vs map district:** Paramasivam calls the first mission's mill "the Podanur mill", but it sits closest to the Singanallur district label, so the HUD shows "Singanallur" there. Story missions 1 and 3 use different mill buildings.
- **Saves are per browser and per device.** Clearing site data erases them, and a save made when opening `index.html` directly isn't shared with a copy of the game hosted online.
- **Mid-mission progress isn't saved.** Reloading during a mission means starting it again.
- **Leftover enemies:** if you fail a story mission, the gang members it spawned stay in the world until they're defeated or cleaned up.
