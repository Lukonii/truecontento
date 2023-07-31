const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE id = $1";
const checkUsernameExists = "SELECT * FROM users WHERE username = $1";
const checkEmailExists = "SELECT * FROM users WHERE email = $1";
const checkIfGoogleEmail =
  "SELECT * FROM users WHERE email = $1 AND login_type = $2";
const checkEmailAndPassword =
  "SELECT * FROM users WHERE email = $1 AND password = $2";
const addUserGoogle =
  "INSERT INTO users (email, password, login_type, referral) VALUES ($1, $2, $3, $4) RETURNING *";
const deleteUser = "DELETE FROM users WHERE id = $1";
const updateUser =
  "UPDATE users SET username = $1, password = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *";
const checkIfUsernameIsTaken =
  "SELECT * FROM users WHERE username = $1 AND id != $2";
const checkIfVerified =
  "SELECT * FROM users WHERE email = $1 AND verified = $2";
const addUserStandard =
  "INSERT INTO users (email, password, login_type, verified, verify_token, referral) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
const checkIfEmailIsTaken = "SELECT * FROM users WHERE email = $1 AND id != $2";
const getUserByEmail = "SELECT * FROM users WHERE email = $1";
const addCreditsForEmail =
  "INSERT INTO userCredits (email, quantity) VALUES ($1, $2) RETURNING *";
const updateCreditsForEmail =
  "UPDATE userCredits SET quantity = quantity + $2 WHERE email = $1";
const getProductByName = "SELECT * FROM products WHERE name = $1";
const addTransaction =
  "INSERT INTO transactions (email, productName, date) VALUES ($1, $2, $3) RETURNING *";
const getDiscountByCode = "SELECT * FROM discounts WHERE discount_code = $1";
const addUsedDiscount =
  "INSERT INTO usedDiscounts (email, discount_code) VALUES ($1, $2) RETURNING *";
const getUserCredits = "SELECT quantity FROM userCredits WHERE email = $1";
const checkTokenExists = "SELECT * FROM users WHERE verify_token = $1";
const updateVerificationStatus =
  "UPDATE users SET verified = $1 WHERE verify_token = $2";
const addCreatedVideoHistory =
  "INSERT INTO createdVideoHistory (email, dirName, sentOnMail) VALUES ($1, $2, $3)";

module.exports = {
  getUsers,
  getUserById,
  checkUsernameExists,
  checkEmailExists,
  addUserGoogle,
  addUserStandard,
  deleteUser,
  updateUser,
  checkIfUsernameIsTaken,
  checkIfEmailIsTaken,
  checkIfGoogleEmail,
  checkEmailAndPassword,
  getUserByEmail,
  addCreditsForEmail,
  updateCreditsForEmail,
  getProductByName,
  addTransaction,
  getDiscountByCode,
  addUsedDiscount,
  getUserCredits,
  checkIfVerified,
  checkTokenExists,
  updateVerificationStatus,
  addCreatedVideoHistory,
};
