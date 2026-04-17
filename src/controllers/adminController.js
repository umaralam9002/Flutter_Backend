const adminDashboard = (req, res) => {
  res.status(200).json({
    message: 'Welcome Admin',
    user: req.user,
  });
};

module.exports = {
  adminDashboard,
};