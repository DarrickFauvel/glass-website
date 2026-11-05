---
title: "Spot the Fallacy"
summary: "Ten short case files. Some contain a logical fallacy, and some are perfectly good reasoning. Can you tell which is which?"
aiAssisted: true
# Each round draws 10 cases: 2 sound, and 8 with no fallacy repeated.
# `answer` and `distractors` are heading slugs from the "Logical fallacies"
# section of content/toolkit.md, or `sound` for reasoning that holds up.
# See "Quiz cases" in content/WRITING_GUIDE.md.
cases:
  # ----- Ad hominem -----
  - id: ad-hominem-hair-sample
    scenario: >-
      At a meetup, a speaker walks through a careful analysis of a mystery hair sample.
      Someone in the audience replies: "Why would I listen to her? She sells real estate for a living."
    answer: ad-hominem
    distractors: [appeal-to-authority, straw-man]
    why: The reply goes after the speaker's job and never touches her analysis. The analysis stands or falls on its own, whoever did it.
    notWhy:
      appeal-to-authority: That fallacy leans on someone's status to support a claim. This reply does the opposite, using the speaker's lack of status to dismiss one.
      straw-man: A straw man misstates what someone argued. This reply doesn't mention her argument at all.
      sound: Credentials can be worth asking about, but the analysis is right there to be checked. Rejecting it because of her day job skips that step.

  - id: ad-hominem-crop-trial
    scenario: >-
      A farmer explains how she reads the results of a crop trial.
      Her neighbor shrugs: "You would say that. You've got a farm to run, and that's all you care about."
    answer: ad-hominem
    distractors: [straw-man, false-dilemma]
    why: The neighbor questions the farmer's motives and leaves her reading of the trial unanswered. Motive can be a reason to check the numbers more carefully, but it isn't a refutation of them.
    notWhy:
      straw-man: The neighbor doesn't restate her position in a weaker form. They just attack her as a person.
      false-dilemma: No one is being forced to pick between two options here.
      sound: A stake in the outcome is worth noticing, but it doesn't show she's wrong. The neighbor never looks at the trial.

  # ----- Straw man -----
  - id: straw-man-air-quality
    scenario: >-
      A parent asks, "Could the school post its air-quality test results?"
      The principal answers: "So you think we're deliberately poisoning children?"
    answer: straw-man
    distractors: [ad-hominem, slippery-slope]
    why: The parent asked for test results. The principal swaps that modest request for an outrageous accusation that's easy to reject.
    notWhy:
      ad-hominem: The principal isn't attacking the parent's character. The trouble is the distorted version of what the parent asked.
      slippery-slope: A slippery slope predicts a chain of worsening events. The principal is rewriting the request, not predicting anything.
      sound: The principal answers a claim the parent never made, so the actual question goes unanswered.

  - id: straw-man-old-pipes
    scenario: >-
      Your friend says, "That creaking is probably just the old pipes."
      You fire back: "Right, so according to you, nothing strange has ever happened to anyone, ever."
    answer: straw-man
    distractors: [false-dilemma, appeal-to-ignorance]
    why: Your friend made a small claim about one noise. You've inflated it into a sweeping claim that's much easier to knock down.
    notWhy:
      false-dilemma: You aren't offering two options to choose from. You're misrepresenting the one thing your friend said.
      appeal-to-ignorance: That would mean treating a lack of proof as proof. Your reply is about what your friend supposedly believes.
      sound: Your friend never said anything like that. The reply argues against a position nobody took.

  # ----- Appeal to authority -----
  - id: authority-astronaut-tea
    scenario: >-
      A famous astronaut says on a podcast that a certain herbal tea clears up joint pain.
      A listener says: "Someone that smart wouldn't get it wrong. That's good enough for me."
    answer: appeal-to-authority
    distractors: [bandwagon, anecdotal-evidence]
    why: Being an expert in spaceflight says little about herbal medicine. The listener is accepting the claim because of who said it, outside that person's field.
    notWhy:
      bandwagon: Bandwagon reasoning relies on how many people believe something. Here it's one celebrated person.
      anecdotal-evidence: The listener isn't generalizing from a personal story. They're relying on the speaker's reputation.
      sound: Expertise only counts within the expert's own field, and the listener hasn't seen any evidence about the tea.

  - id: authority-moon-book
    scenario: >-
      "This surgeon wrote a bestselling book saying the phases of the moon control your mood.
      He's a doctor, so that settles it."
    answer: appeal-to-authority
    distractors: [bandwagon, ad-hominem]
    why: A medical degree may be evidence of expertise, but it isn't proof, and "that settles it" treats it as proof. The claim still needs evidence of its own.
    notWhy:
      bandwagon: The book's sales aren't doing the work here. The argument rests on "he's a doctor."
      ad-hominem: That fallacy attacks a person to dismiss a claim. This argument praises a person to support one.
      sound: An expert's view can be a reason to take a claim seriously, but it can't settle the question alone.

  # ----- Appeal to ignorance -----
  - id: ignorance-lake-creature
    scenario: >-
      "Nobody has ever proved there isn't a giant creature in that lake, so it's probably down there."
    answer: appeal-to-ignorance
    distractors: [special-pleading, false-dilemma]
    why: A lack of disproof isn't evidence for the creature. The burden of proof sits with the person making the claim.
    notWhy:
      special-pleading: Special pleading exempts one case from a standard. This argument isn't asking for an exemption. It treats missing proof as proof.
      false-dilemma: No limited set of options is being offered. The flaw is in what's being counted as evidence.
      sound: The speaker has no evidence for the creature. They only have the absence of evidence against it.

  - id: ignorance-attic
    scenario: >-
      "The investigators couldn't work out what was causing the cold spot in the attic, so the house must be haunted."
    answer: appeal-to-ignorance
    distractors: [post-hoc, false-dilemma]
    why: 'Not knowing the cause is where the evidence stops. Jumping to a ghost fills the gap with a conclusion.'
    notWhy:
      post-hoc: Post hoc claims that one thing caused another because it came first. Nothing here is about the order of events.
      false-dilemma: This comes close, but the speaker doesn't offer a choice of two options. They go straight from "unexplained" to "haunted."
      sound: An unexplained result only tells you it's unexplained. It doesn't point toward any particular answer.

  # ----- Post hoc -----
  - id: post-hoc-cell-tower
    scenario: >-
      "The new cell tower went up in March. By April, the bees on our street had started dying off. It has to be the tower."
    answer: post-hoc
    distractors: [anecdotal-evidence, texas-sharpshooter]
    why: The tower came first and the bees came second, and that order is the only link offered. Coming first doesn't show that it caused anything.
    notWhy:
      anecdotal-evidence: The core of the argument is timing, one event following another, rather than a personal story stretched to cover everyone.
      texas-sharpshooter: That fallacy picks a pattern out of lots of random data after the fact. This argument simply rests on the sequence of two events.
      sound: The timing could be a reason to investigate. "It has to be" goes much further than that.

  - id: post-hoc-lucky-socks
    scenario: >-
      "I changed into my lucky socks at halftime, and we scored twice right after. The socks did it."
    answer: post-hoc
    distractors: [anecdotal-evidence, special-pleading]
    why: The goals came after the socks, and that's all the speaker has. Plenty of things happened at halftime, and any of them came before those goals too.
    notWhy:
      anecdotal-evidence: It is a personal story, but the specific error is reading cause into sequence. The speaker isn't generalizing to anyone else.
      special-pleading: The speaker isn't exempting themselves from any rule.
      sound: One game gives no way to compare what would have happened with different socks.

  # ----- False dilemma -----
  - id: false-dilemma-airport-light
    scenario: >-
      "That light over the airport was either an alien craft or the government is lying to us. So which is it?"
    answer: false-dilemma
    distractors: [straw-man, appeal-to-ignorance]
    why: Only two options are on the table, when there are many ordinary possibilities the speaker has left out.
    notWhy:
      straw-man: Nobody's position is being misrepresented. The problem is the artificially short list of options.
      appeal-to-ignorance: The speaker isn't saying "unproven, so true." They're squeezing every explanation into two boxes.
      sound: The two options aren't the only possibilities, so the choice being demanded isn't a fair one.

  - id: false-dilemma-healing
    scenario: >-
      "You either trust natural healing, or you're a puppet of the drug companies. Pick a side."
    answer: false-dilemma
    distractors: [ad-hominem, straw-man]
    why: This ignores all the positions in between, such as judging each treatment on its own evidence.
    notWhy:
      ad-hominem: '"Puppet" is an insult, but the structure of the argument is the forced choice. It would fail even if it were said politely.'
      straw-man: This comes close, but the main move is limiting the options, not rewording something a particular person said.
      sound: There are plenty of other positions, so "pick a side" is a choice nobody has to accept.

  # ----- Slippery slope -----
  - id: slippery-slope-library
    scenario: >-
      "If the library cancels one print magazine, it'll cancel them all. Then the books go, and before long the whole building is a parking lot."
    answer: slippery-slope
    distractors: [false-dilemma, straw-man]
    why: One small step gets stretched into an extreme outcome, and no evidence is offered for any link in the chain.
    notWhy:
      false-dilemma: There's no forced choice here. The argument is a chain of predicted consequences.
      straw-man: Straw man would need someone's actual view to be distorted. This is a prediction, and an exaggerated one.
      sound: Chains of consequences can be real, but each link needs support, and this one gives none.

  - id: slippery-slope-apple
    scenario: >-
      "Approve one gene-edited apple, and in ten years nobody will be allowed to grow real food."
    answer: slippery-slope
    distractors: [false-dilemma, post-hoc]
    why: The argument leaps from one approval to an extreme future, skipping every step in between. Each of those steps would need its own evidence.
    notWhy:
      false-dilemma: The speaker isn't saying there are only two options. They're predicting an inevitable slide.
      post-hoc: Post hoc looks back at something that already happened. This argument looks forward at something that might.
      sound: Nothing connects one approval to that outcome. The likelihood of each step is simply assumed.

  # ----- Special pleading -----
  - id: special-pleading-dowser
    scenario: >-
      A dowser misses every target in a controlled test. "That doesn't count," they say. "Dowsing only works when it really matters, and a test never really matters."
    answer: special-pleading
    distractors: [appeal-to-ignorance, cherry-picking]
    why: Any other skill would be judged by the test. The dowser gives their own claim an exemption, made up after it failed.
    notWhy:
      appeal-to-ignorance: The dowser isn't claiming that a lack of proof is proof. They're excusing their claim from the test.
      cherry-picking: This comes close, since a bad result is being set aside, but the giveaway is the special rule invented just for dowsing.
      sound: If a claim can never be tested because real tests never count, the excuse has made it impossible to check.

  - id: special-pleading-spirits
    scenario: >-
      "Sure, most claims need evidence. But spirits are different. You can't hold them to that standard."
    answer: special-pleading
    distractors: [straw-man, appeal-to-ignorance]
    why: The speaker accepts the standard for everything else, then exempts their own claim without giving a reason.
    notWhy:
      straw-man: No one's view is being distorted. The speaker is stating their own position and asking for an exception.
      appeal-to-ignorance: The speaker doesn't say the claim is true for lack of disproof. They say the usual rules shouldn't apply.
      sound: The speaker offers no reason why this one claim should be treated differently from any other.

  # ----- Cherry-picking -----
  - id: cherry-picking-supplement
    scenario: >-
      A supplement's website quotes the two small trials that found a benefit. Its own footnotes list eleven larger trials that found none, but the page never discusses them.
    answer: cherry-picking
    distractors: [texas-sharpshooter, anecdotal-evidence]
    why: Evidence that doesn't fit is known about and left out of the argument. A fair summary would weigh all thirteen trials.
    notWhy:
      texas-sharpshooter: The sharpshooter finds a pattern in random noise after the fact. Here, known evidence on the same question is being set aside.
      anecdotal-evidence: These are trials, not personal stories. The flaw is in which trials get discussed.
      sound: Leaving out eleven larger trials makes the summary misleading, even though the two quoted trials are real.

  - id: cherry-picking-cold-weeks
    scenario: >-
      "Three chilly weeks in a row! So much for the warming trend," says a man standing right in front of a fifty-year temperature chart he just skipped past.
    answer: cherry-picking
    distractors: [texas-sharpshooter, anecdotal-evidence]
    why: Three convenient weeks are picked out while the fifty-year record is ignored. A long trend can't be judged from the few data points that suit you.
    notWhy:
      texas-sharpshooter: This comes close, but the sharpshooter draws a target around a random cluster. This speaker is ignoring relevant data that's right in front of him.
      anecdotal-evidence: It's a small sample, but the giveaway is the larger record he skipped.
      sound: Three weeks can't overturn a fifty-year record, and he had the record available.

  # ----- Texas sharpshooter -----
  - id: sharpshooter-predictions
    scenario: >-
      A psychic publishes 400 predictions every January. Each December, their website circles the five that came true and calls them proof.
    answer: texas-sharpshooter
    distractors: [anecdotal-evidence, post-hoc]
    why: The target gets painted after the shots are fired. With 400 guesses, a handful of hits could easily come from luck, and the misses vanish from view.
    notWhy:
      anecdotal-evidence: This isn't one person's story being generalized. It's a selective reading of many results after the fact.
      post-hoc: Post hoc is about one event supposedly causing a later one. Here, the hits are picked out after the results are in.
      sound: Five hits only mean something if you count the 395 misses, and the website doesn't.

  - id: sharpshooter-county-map
    scenario: >-
      Someone maps every reported headache in a county, spots one street with a few extra, and draws a circle around it: "Look at this cluster. Something on this street is making people sick."
    answer: texas-sharpshooter
    distractors: [post-hoc, appeal-to-ignorance]
    why: Random scatter always produces some clumps. Drawing the circle after seeing the dots makes a clump look like a target that was hit on purpose.
    notWhy:
      post-hoc: Nothing here depends on one event coming before another. The pattern was picked out of a map after the fact.
      appeal-to-ignorance: The speaker isn't relying on a lack of proof. They're relying on a pattern they drew themselves.
      sound: A cluster can be worth a follow-up, but one chosen after looking at the data can't show a cause on its own.

  # ----- Bandwagon -----
  - id: bandwagon-horoscopes
    scenario: >-
      "Millions of people read their horoscope every single day. They can't all be wrong."
    answer: bandwagon
    distractors: [appeal-to-authority, anecdotal-evidence]
    why: The number of people who believe something tells you what's popular, not what's true.
    notWhy:
      appeal-to-authority: The argument doesn't point to an expert. It points to a crowd.
      anecdotal-evidence: No individual story is being used. The argument rests on sheer numbers.
      sound: Popularity is the only reason given, and it says nothing about whether horoscopes are accurate.

  - id: bandwagon-crystal-bottles
    scenario: >-
      "More and more people are switching to crystal-infused water bottles. There must be something to it."
    answer: bandwagon
    distractors: [anecdotal-evidence, appeal-to-ignorance]
    why: A growing trend is being treated as evidence. It shows that the bottles are catching on, not that they do anything.
    notWhy:
      anecdotal-evidence: No one's personal experience is offered. The trend itself is the argument.
      appeal-to-ignorance: The argument isn't that nobody has disproved it. It's that lots of people are doing it.
      sound: 'The conclusion needs evidence about the bottles, and the argument only offers evidence about buyers.'

  # ----- Anecdotal evidence -----
  - id: anecdotal-uncle
    scenario: >-
      "My uncle smoked two packs a day and lived to 95, so those health warnings must be overblown."
    answer: anecdotal-evidence
    distractors: [post-hoc, cherry-picking]
    why: One person's life is too small a sample to tell you about risk across a population. His story can be true without showing what the speaker claims.
    notWhy:
      post-hoc: The speaker isn't saying that smoking caused his long life. They're generalizing from a single case.
      cherry-picking: This comes close, but the speaker isn't shown setting aside evidence they know about. The core problem is reasoning from one story.
      sound: The story may be accurate, but one case can't tell you what's typical.

  - id: anecdotal-diet
    scenario: >-
      "My sister tried that diet and felt fantastic. It clearly works for everyone."
    answer: anecdotal-evidence
    distractors: [bandwagon, post-hoc]
    why: The sister's experience is real, but "everyone" can't be concluded from one person.
    notWhy:
      bandwagon: One sister isn't a crowd. The speaker isn't saying it's true because it's popular.
      post-hoc: Timing plays a part in her story, but the bigger leap is from one person to everyone.
      sound: Her experience is worth hearing, but it can't support a claim about everyone.

  # ----- Reasoning that holds up -----
  - id: sound-dentist
    scenario: >-
      Your dentist points to a dark spot on your X-ray and explains why it suggests a cavity. You book the filling, and you'd get a second opinion if it were a bigger job.
    answer: sound
    distractors: [appeal-to-authority, bandwagon, anecdotal-evidence]
    why: You're relying on an expert in their own field, who showed you the evidence, and your caution matches the stakes. That's a reasonable use of expertise.
    notWhy:
      appeal-to-authority: Trusting an expert isn't automatically a fallacy. It becomes one when status replaces evidence or the person is outside their field, and neither is true here.
      bandwagon: Nobody is appealing to what's popular.
      anecdotal-evidence: This isn't a generalization from one story. It's a judgment about your own tooth, based on your own X-ray.

  - id: sound-lights-video
    scenario: >-
      "I can't tell what those lights in the video are. Until there's more to go on, I'm not calling it aliens or a hoax."
    answer: sound
    distractors: [appeal-to-ignorance, false-dilemma, straw-man]
    why: The speaker lets "I don't know" stand. That's the honest position when the evidence runs out.
    notWhy:
      appeal-to-ignorance: That fallacy turns "unknown" into a conclusion. This speaker refuses to do so.
      false-dilemma: Two options get mentioned, but the speaker rejects both for now and doesn't force a choice.
      straw-man: No one's position is being distorted.

  - id: sound-sealed-envelopes
    scenario: >-
      A local psychic agrees to guess the cards in 100 sealed envelopes, with the rules set in advance. The hits come out about where chance predicts, so the group says this test gave the claim no support.
    answer: sound
    distractors: [special-pleading, ad-hominem, cherry-picking]
    why: The rules were agreed beforehand, every result counted, and the conclusion is limited to what this test showed.
    notWhy:
      special-pleading: No one gets an exemption here. The psychic agreed to the rules in advance, and they applied to everybody.
      ad-hominem: The group judges the results and says nothing about the psychic as a person.
      cherry-picking: All 100 guesses counted, so nothing was left out.

  - id: sound-roof-leak
    scenario: >-
      The inspector shows you the water stain, the damp beam, and the moisture readings. "Leave this leak through winter and the beam is likely to rot, and then the ceiling repair gets a lot more expensive."
    answer: sound
    distractors: [slippery-slope, post-hoc, false-dilemma]
    why: This is a chain of consequences, but each link is short and supported by what the inspector measured. Some chains are real.
    notWhy:
      slippery-slope: Not every chain of consequences is a slippery slope. This one is modest, and there's evidence for each step.
      post-hoc: The inspector isn't inferring cause from timing. There's a known mechanism and direct measurements.
      false-dilemma: The inspector doesn't say there are only two options.

  - id: sound-funded-study
    scenario: >-
      "The only study behind this supplement was paid for by the company selling it. That doesn't prove it's wrong, but I'd want an independent test before I trust it."
    answer: sound
    distractors: [ad-hominem, cherry-picking, appeal-to-authority]
    why: A conflict of interest is a good reason for caution. The speaker doesn't call the claim false, and asks for better evidence.
    notWhy:
      ad-hominem: This would be ad hominem if the speaker dismissed the study because of who paid for it. They only say it isn't enough yet.
      cherry-picking: The speaker is considering the only study there is, so nothing is being left out.
      appeal-to-authority: The speaker isn't resting a claim on anyone's status.

  - id: sound-tomato-beds
    scenario: >-
      To test a fertilizer, you randomly choose half your tomato beds to receive it. After three seasons, the treated beds keep out-producing the others.
    answer: sound
    distractors: [post-hoc, anecdotal-evidence, texas-sharpshooter]
    why: Random assignment and a comparison group rule out the easy alternatives, and repeating it over three seasons makes a fluke less likely.
    notWhy:
      post-hoc: Unlike post hoc, this doesn't rely on before and after alone. The untreated beds show what would have happened anyway.
      anecdotal-evidence: This is a designed comparison repeated over three seasons, not a one-off story.
      texas-sharpshooter: The question was set before the results came in, so the target was painted first.

  - id: sound-expert-consensus
    scenario: >-
      "I'm not a geologist, but every major geological society that reviewed the evidence reached the same conclusion. I'll go with that unless the evidence changes."
    answer: sound
    distractors: [bandwagon, appeal-to-authority, cherry-picking]
    why: Relevant experts independently reviewing the evidence is a good reason to accept a conclusion, and the speaker stays open to new evidence.
    notWhy:
      bandwagon: A consensus of relevant experts who examined the evidence is different from a head count of the general public.
      appeal-to-authority: That fallacy uses authority as proof, or borrows it from outside the field. These are the right experts, and the speaker holds the view provisionally.
      cherry-picking: The speaker is relying on the full body of expert reviews, not selected ones.
---
