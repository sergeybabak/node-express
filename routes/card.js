const {Router} = require('express');
//const Card = require('../models/card'); json
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();

function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.courseId._doc, 
    id: c.courseId.id,
    count: c.count
  }));
}

function computePrice(courses) {
  return courses.reduce((total, course) => {
    return total += course.price * course.count;
  }, 0);
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  //await Card.add(course); json
  await req.user.addToCart(course);
  res.redirect('/card');
});

router.delete('/remove/:id', auth, async (req, res) => {
  // const card = await Card.remove(req.params.id); json
  // res.status(200).json(card);
  await req.user.removFromCart(req.params.id);
  const user = await req.user.populate('cart.items.courseId');
  const courses = mapCartItems(user.cart);
  const cart = {
    courses, price: computePrice(courses)
  };
  res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
  // const card = await Card.fetch(); json
  const user = await req.user.populate('cart.items.courseId');

  const courses = mapCartItems(user.cart);

  res.render('card', {
    title: 'Корзина',
    isCard: true,
    courses: courses,
    price: computePrice(courses)
  });
});

module.exports = router;