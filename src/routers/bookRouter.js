import express from 'express';
import {
  createBook,
  deleteBook,
  getABook,
  getAllBooks,
  getBookById,
  updateBookById,
} from '../models/book/BookModel.js';
import {
  adminAuth,
  getUserFromAcessJWT,

  // getUserFromAcessJWT,
  userAuth,
} from '../middlewares/authMiddleware.js';
import {
  newBookValidation,
  updateBookValidation,
} from '../middlewares/joiValidation.js';

const router = express.Router();

router.get('/:_id?', async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let filter = { status: 'active' };
    if (authorization) {
      const user = await getUserFromAcessJWT(authorization);

      if (user?.role === 'admin') {
        filter = {};
      }
    }

    //who is making, if admin, send all otherwise send only active books
    const { _id } = req.params;
    const books = _id
      ? await getABook({ ...filter, _id })
      : await getAllBooks(filter);
    res.json({
      status: 'success',
      message: 'Here are the books',
      books,
    });
  } catch (error) {
    next(error);
  }
});

//Private endpoints
router.post('/', userAuth, newBookValidation, async (req, res, next) => {
  try {
    if (req.userInfo.role !== 'admin') {
      throw new Error('You do not have permission to this  api');
    }
    const books = await createBook(req.body);

    books?._id
      ? res.json({
          status: 'success',
          message: 'New book has been added successfully',
          books,
        })
      : res.json({
          status: 'error',
          message: 'Unable to add books, try again later',
          books,
        });
  } catch (error) {
    console.log(error.message);
    if (error.message.includes('E11000 duplicate key error collection')) {
      error.message =
        'There is another book that has similar ISBN. Plase change the isbn and try again';

      error.errorCode = 200;
    }
    next(error);
  }
});

//   private endpoints
router.put('/', adminAuth, updateBookValidation, async (req, res, next) => {
  try {
    const books = await updateBookById(req.body);

    books?._id
      ? res.json({
          status: 'success',
          message: 'The book has been updated successfully!',
          books,
        })
      : res.json({
          status: 'Error',
          message: 'Unable to upedate the  book, try again later',
          books,
        });
  } catch (error) {
    next(error);
  }
});

//Delete book
router.delete('/:_id', adminAuth, async (req, res, next) => {
  try {
    const { _id } = req.params;
    const books = await deleteBook(_id);

    books?._id
      ? res.json({
          status: 'success',
          message: 'The book has been deleted successfully!',
          books,
        })
      : res.json({
          status: 'Error',
          message: 'Unable to deleted the  book, try again later',
          books,
        });
  } catch (error) {
    next(error);
  }
});

export default router;
