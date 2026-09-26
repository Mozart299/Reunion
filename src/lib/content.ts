export type DeckId = "mlt" | "nhie" | "hot" | "dare" | "guess"

export type Deck = {
  id: DeckId
  name: string
  lead: string
  how: string
  /** Tailwind colour token name from globals.css */
  color: "sun" | "pink" | "cyan" | "tang" | "lime"
  timed?: boolean
  cards: string[]
}

export const DECKS: Deck[] = [
  {
    id: "mlt",
    name: "Most Likely To",
    lead: "Who's most likely to…",
    how: "Read it out, count 3-2-1, everyone points at someone.",
    color: "sun",
    cards: [
      "still have their old school ID card somewhere",
      "have married their school crush",
      "become famous, or already be secretly famous",
      "get lost on the way to this reunion",
      "still owe someone in this room money",
      "look exactly the same at the next reunion",
      "be the first to cry today",
      "remember every teacher's full name",
      "have been sent out of class the most",
      "still be in touch with a teacher",
      "win a reality TV show",
      "move abroad and never come back",
      "run for office one day",
      "end up teaching at our old school",
      "organise the next reunion",
      "still have their old exercise books",
      "have a secret talent nobody knows about",
      "fall asleep at this party",
      "have changed the most since school",
      "have changed the least since school",
      "start an argument in the group chat",
      "survive a zombie apocalypse",
      "be late to their own wedding",
      "still know the school song word for word",
      "have the most chaotic phone gallery",
      "talk their way out of a speeding ticket",
      "adopt five cats",
      "become a millionaire and forget us all",
      "have been the teacher's favourite",
      "go viral online by accident",
    ],
  },
  {
    id: "nhie",
    name: "Never Have I Ever",
    lead: "Never have I ever…",
    how: "Anyone who HAS done it stands up, drinks or loses a point.",
    color: "pink",
    cards: [
      "copied someone's homework",
      "faked being sick to skip school",
      "had a crush on a teacher",
      "been sent to the head teacher's office",
      "fallen asleep in class",
      "sneaked out of school during the day",
      "lied to my parents about my exam results",
      "forged a parent's signature",
      "cried over a grade",
      "eaten someone else's lunch without asking",
      "been caught passing notes",
      "been punished for something I didn't do",
      "had a nightmare about an exam I didn't study for",
      "kept in touch with a school ex",
      "checked someone's social media before coming today",
      "pretended to read a set book",
      "cheated in a test",
      "hidden in the toilets to skip a lesson",
      "had a crush on someone in this room",
      "blamed a classmate for something I did",
      "been caught sleeping in assembly",
      "lost something I borrowed and never told them",
      "laughed so hard in class I got sent out",
      "pretended to be sick to avoid PE",
      "written a love letter I never sent",
    ],
  },
  {
    id: "hot",
    name: "Hot Seat",
    lead: "In the hot seat:",
    how: "Spin the Picker. That person answers honestly. One pass each.",
    color: "cyan",
    cards: [
      "What's one thing you'd tell your school-age self?",
      "Who was your first crush in school?",
      "What's your most embarrassing school moment?",
      "Which teacher do you still think about, and why?",
      "What did you think you'd be doing by now?",
      "What's the best thing that's happened to you since school?",
      "Which rumour about you in school was false? Was any of them true?",
      "What's your best school trip memory?",
      "What did you get away with that nobody knows about?",
      "Which subject was a complete waste of time?",
      "Who in this room did you completely misjudge in school?",
      "What skill did you pick up after school that would surprise us?",
      "What song takes you straight back to school?",
      "What were you known for in school?",
      "Describe your school self in three words.",
      "What are you proudest of since we last saw each other?",
      "What's the silliest thing you were ever punished for?",
      "Which school tradition should come back?",
      "Who in this room would you swap lives with for a day?",
      "What's one school memory you'll never forget?",
      "Who was the funniest person in our class, and who is it now?",
      "What's something you still have from school?",
    ],
  },
  {
    id: "dare",
    name: "School Dares",
    lead: "Your dare:",
    how: "Do it, or your team loses a point.",
    color: "tang",
    cards: [
      "Do an impression of a teacher. The group guesses who.",
      "Recite something you had to memorise in school.",
      "Sing the school song, or whatever you still remember of it.",
      "Act out how you used to sneak in late to class.",
      "Show the most recent photo in your gallery.",
      "Do the dance everyone did when we were in school.",
      "Give a 30-second speech as if you were running for class captain.",
      "Talk like your strictest teacher until your next turn.",
      "Name 10 classmates who aren't here in 30 seconds.",
      "Text a classmate who isn't here: \"We're at the reunion talking about you 👀\"",
      "Swap an item of clothing with the person on your left.",
      "Do 10 push-ups like it's PE class.",
      "Draw the school badge from memory.",
      "Tell a joke. If nobody laughs, take another dare.",
      "Hum a song. The first person to guess it picks the next dare.",
      "Show the oldest photo on your phone.",
      "Take attendance of everyone here in a teacher voice.",
      "Re-enact a famous moment from our school days with two helpers.",
      "Let the group write your status update for today.",
      "Give a sincere 20-second compliment to the person across from you.",
    ],
  },
  {
    id: "guess",
    name: "Guess It!",
    lead: "",
    how: "Heads Up style. Phone on your forehead, your team shouts clues. 60 seconds.",
    color: "lime",
    timed: true,
    cards: [
      "Pop quiz", "Detention", "Morning assembly", "Sports day", "School bus", "Homework", "Lunch break",
      "Head teacher", "Report card", "Chemistry lab", "Exam hall", "Science fair", "School trip", "Class monitor",
      "Uniform check", "Chalkboard", "Lost property", "Graduation", "School bell", "Library", "Group project",
      "PE class", "Canteen queue", "Timetable", "Parents' day", "Cheat sheet", "Talent show", "School choir",
      "Debate club", "Football match", "Staff room", "Spelling test", "Holiday homework", "Exam results",
      "Class photo", "Fire drill", "Pencil case", "Calculator", "Geometry set", "Textbook", "Roll call",
      "Tuck shop", "Prefect", "Hall pass", "Sharpener", "Maths teacher", "Biology dissection",
      "Last day of school", "Class clown", "Teacher's pet", "Back bench", "School dance", "Break time",
      "Dictionary", "Principal's speech",
    ],
  },
]

export const TEAM_STYLES: { name: string; color: Deck["color"] | "lilac" }[] = [
  { name: "Back Benchers", color: "sun" },
  { name: "Front Row", color: "pink" },
  { name: "Detention Crew", color: "cyan" },
  { name: "Late Comers", color: "tang" },
  { name: "Class Clowns", color: "lime" },
  { name: "Prefects", color: "lilac" },
]

export const EXAMPLE_NAMES = ["Amina", "Brian", "Chloe", "David", "Esther", "Felix", "Grace", "Hassan", "Irene"]

export const ROUND_SECONDS = 60

/** Static class maps so Tailwind sees every colour class at build time. */
export const TEXT: Record<string, string> = {
  sun: "text-sun", pink: "text-pink", cyan: "text-cyan", tang: "text-tang", lime: "text-lime", lilac: "text-lilac",
}
export const BG: Record<string, string> = {
  sun: "bg-sun", pink: "bg-pink", cyan: "bg-cyan", tang: "bg-tang", lime: "bg-lime", lilac: "bg-lilac",
}
export const BORDER: Record<string, string> = {
  sun: "border-sun", pink: "border-pink", cyan: "border-cyan", tang: "border-tang", lime: "border-lime", lilac: "border-lilac",
}

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
