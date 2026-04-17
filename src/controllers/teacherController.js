const teacherDashboard = (req, res) => {
  res.status(200).json({
    message: 'Welcome Teacher',
    user: req.user,
  });
};

module.exports = {
  teacherDashboard,
};