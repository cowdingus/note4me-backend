const express = require("express");
const {check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../model/User");

router.get(
	"/me", auth, async (req, res) => {
		try {
			const user = await User.findById(req.user.id);
			res.json(user);
		} catch (e) {
			res.send({message: "Error in fetching user"});
		}
	}
);

router.post(
	"/login",
	[
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Please enter a valid password").isLength({min: 6})
	],
	async (req, res) => {
		// Ensure argument completeness
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array()
			});
		}

		const {email, password} = req.body;

		try {
			let user = await User.findOne({email});

			// Ensure user existence
			if (!user) {
				return res.status(400).json({
					message: "User does not exist"
				});
			}

			// Ensure hashed password matches with the user password
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({
					message: "Incorrect password!"
				});
			}

			// Generate JWT token
			const jwtPayload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				jwtPayload,
				"randomString",
				{
					expiresIn: 3600
				},
				(err, token) => {
					if (err) throw err;
					res.status(200).json({
						token
					});
				}
			);

		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Server error"
			});
		}
	}
);

router.post(
	"/signup",
	[
		check("username", "Please enter a valid username").not().isEmpty(),
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Please enter a valid password").isLength({min: 6})
	],
	async (req, res) => {
		// Ensure argument completeness
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array()
			});
		}

		const {username, email, password} = req.body;

		try {
			// Ensure nonexistence of user with same email
			if (await User.exists({email})) {
				return res.status(400).json({
					message: "User already exists"
				});
			}

			// Salt password
			const salt = await bcrypt.genSalt(10);
			const saltedPassword = await bcrypt.hash(password, salt);

			// Create new user
			let user = new User({
				username,
				email,
				saltedPassword
			});

			await user.save();

			// Generate JWT
			const jwtPayload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				jwtPayload,
				"randomString", {
					expiresIn: 10000
				},
				(err, token) => {
					if (err) throw err;
					res.status(200).json({token});
				}
			);

		} catch (err) {
			console.log(err.message);
			res.status(500).send("Error in saving");
		}
	}
);

module.exports = router;
