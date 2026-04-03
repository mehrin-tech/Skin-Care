export const getAboutPage = (req, res) => {
  res.render("about", {
    title: "About Us",
    clinicName: "SkinCare Clinic"
  });
};