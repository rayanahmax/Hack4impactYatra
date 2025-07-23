const Preference = require('../models/preferences.models')
const User = require('../models/User')

exports.createPreference = async (req, res) => {
      const {user, interest } = req.body;

  try {
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({ message: "User Not found" });
    }

    if (!user || !interest) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const newInterest = await Preference.create({
        user,
        interest
    })

    res.status(201).json({
      message: "interest created successfully",
      Interest: newInterest,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


//to get all Preference of a user
exports.getAllPreference =async (req, res) => {
    const {id} = req.params

    try {
        const getUser = await Preference.findOne({user: id}).populate('user', 'name country')
        res.status(200).json(getUser)
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

