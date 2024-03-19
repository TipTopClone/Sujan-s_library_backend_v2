import express from 'express';
import { updateBurrow } from '../models/burrow/BurrowModel.js';
import { newReviewValidation } from '../middlewares/joiValidation.js';
import { updateBookById } from '../models/book/BookModel.js';
import { adminAuth, userAuth } from '../middlewares/authMiddleware.js';
import {
  createReview,
  deleteReview,
  getManyReview,
  updateReview,
} from '../models/review/ReviewModel.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // const { role, _id } = req.userInfo;
    // if admin makes request, return all the burrow history, if logedin user make requests then return their burrow only based on the userId in burrow table
    const reviews = await getManyReview();

    res.json({
      status: 'success',
      message: 'Here is the list of reviews',
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', userAuth, newReviewValidation, async (req, res, next) => {
  try {
    const userId = req.userInfo._id;
    const result = await createReview({ ...req.body, userId });
    if (result?._id) {
      //update burrow table and add the review id to the burrow history
      await updateBurrow(
        { _id: req.body.burrowHistoryId },
        { reviewGiven: result._id }
      );

      return res.json({
        status: 'success',
        message:
          'You have successfully reviewed the book. Admin will verify your review soon',
      });
    }
    res.json({
      status: 'error',
      message: 'Unable to process your review, pelase try again later',
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:_id', adminAuth, async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    if (['active', 'inactive'].includes(status)) {
      const result = await updateReview({ _id }, { status });

      if (result?._id) {
        return res.json({
          status: 'success',
          message: 'The review has been update',
        });
      }
    }

    res.json({
      status: 'error',
      message: 'Something went wrong! pelase contact administration',
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:_id', adminAuth, async (req, res, next) => {
  try {
    const { _id } = req.params;

    const result = await deleteReview({ _id });

    if (result?._id) {
      return res.json({
        status: 'success',
        message: 'The review has been Deleted',
      });
    }

    res.json({
      status: 'error',
      message: 'Something went wrong! pelase contact administration',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
