import express from 'express';
import {
  createBurrow,
  getManyBurrow,
  updateBurrow,
} from '../models/burrow/BurrowModel.js';

import { updateBookById } from '../models/book/BookModel.js';
import { newBurrowValidation } from '../middlewares/joiValidation.js';
const router = express.Router();

router.get('/:_id?', async (req, res, next) => {
  try {
    const { role, _id } = req.userInfo;
    // if admin makes request, return all the burrow history, if logedin user make requests then return their burrow only based on the userId in burrow table
    const burrows =
      role === 'admin'
        ? await getManyBurrow({})
        : getManyBurrow({ userId: _id });

    burrows.length
      ? res.json({
          status: 'success',
          message: 'Here is the list of burrow history',
          burrows,
        })
      : res.json({
          status: 'error',
          message:
            'Unable to return burrow history , please contact adminstration.',
        });
  } catch (error) {
    next(error);
  }
});

router.post('/', newBurrowValidation, async (req, res, next) => {
  try {
    const numberOfDaysToReturn = 15;
    let dueDate = new Date();

    dueDate.setDate(dueDate.getDate() + numberOfDaysToReturn);

    const result = await createBurrow({ ...req.body, dueDate });
    if (result?._id) {
      //udate book isaviale to false

      await updateBookById({
        _id: req.body.bookId,
        isAvailable: false,
        dueDate,
      });

      return res.json({
        status: 'success',
        message:
          'You have successfully borrowed this book, you can check your burrow history to find this information.',
      });
    }
    res.json({
      status: 'error',
      message: 'Unable to burrow the book , please contact adminstration.',
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:_id', async (req, res, next) => {
  try {
    const { _id } = req.params;
    const userId = req.userInfo;

    const filter = { _id, userId };

    const update = {
      isReturned: true,
      returnedDate: Date(),
    };

    const result = await updateBurroww(filter, update);

    if (result?._id) {
      //update the book
      const bookUpdate = {
        _id: result.bookId,
        isAvailable: true,
        dueDate: null,
      };

      await updateBookById(bookUpdate);
      return res.json({
        status: 'success',
        message: 'You have successfully returned the book. Thank you.',
      });
    }
    res.json({
      status: 'error',
      message: 'Something went wrong! Please contact the administration.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
