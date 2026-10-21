/* Editable invitation settings.
   Event wording lives in index.html.
   Replace gallery src values with your photographs, for example assets/gallery/moment-1.jpg
   Replace the music file at assets/music/wedding-music.mp3 if you prefer another legal instrumental. */
window.INVITE = {
  countdownISO: "2026-12-05T19:00:00+05:30",
  timeZoneLabel: "Asia/Kolkata",
  weddingDayMessage: "The wedding day is here. Mousami and Pritam welcome you with love.",
  music: {
    src: "assets/music/wedding-music.mp3",
    volume: 0.36,
    showCredit: false,
    credit: "Sitar, Raga Yaman — Tito Dutta · CC BY-SA 3.0"
  },
  share: {
    title: "Mousami Weds Pritam",
    text: "You are invited to the wedding of Mousami and Pritam on Saturday, 5 December 2026, 7:00 PM onwards, at Wonder Country Club & Resort, Near Chowrangee, Kharagpur."
  },
  maps: {
    wedding: "https://www.google.com/maps/search/?api=1&query=Wonder%20Country%20Club%20%26%20Resort%2C%20Near%20Chowrangee%2C%20Kharagpur%2C%20West%20Bengal%2C%20India",
    inda: "https://www.google.com/maps/search/?api=1&query=22.357992616463946,87.33441857512105"
  },
  gallery: [
    {
      src: "Image/wedding.jpeg",
      alt: "Bengali groom in a topor offering sindoor to a bride in a red saree",
      wide: true
    },
    {
      src: "Image/Mehendi.jpeg?v=2",
      alt: "Illustrated mehendi celebration with decorated hands and hanging umbrellas",
      wide: false
    },
    {
      src: "Image/Haldi.jpeg?v=2",
      alt: "Illustrated haldi ceremony with marigolds and turmeric",
      wide: false
    },
    {
      src: "assets/gallery/moment-1.svg",
      alt: "Lotus and alpana artwork",
      wide: true
    },
    {
      src: "assets/gallery/moment-3.svg",
      alt: "Bengali wedding topor",
      wide: false
    },
    {
      src: "assets/gallery/moment-6.svg",
      alt: "Conch shell and lotus",
      wide: false
    }
  ]
};
