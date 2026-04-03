export const getHomePage = (req, res) => {
  const data = {
    title: 'Skin-Care Clinic',
    message: 'Welcome to the Skin-Care !'
  };
  res.render('index', data);
};
