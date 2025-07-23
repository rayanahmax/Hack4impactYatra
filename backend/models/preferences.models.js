const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    interest: [
      {
        type: String,
        require: true,
        enum: [
          "Nature & Mountains",
          "Culture & Heritage",
          "Spirituality & Wellness",
          "Adventure & Outdoor Activities",
          "Local Food & Culinary Experiences",
          "Arts, Music & Handicrafts",
          "Wildlife & Ecology",
          "City Life & Urban Exploration",
          "Community & Rural Life",
          "Festivals & Events",
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Preference", preferenceSchema);
