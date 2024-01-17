import BookSchema from './BookSchema.js';

//create
export const createBook = (bookObj) => {
  return BookSchema(bookObj).save();
};

//read @filter must be an object

export const getAllBooks = (filter) => {
  return BookSchema.find(filter);
};
export const getABook = (filter) => {
  return BookSchema.findOne(filter);
};

export const getBookById = (_id) => {
  return BookSchema.findById(_id);
};

//update book
export const updateBookById = ({ _id, ...rest }) => {
  return BookSchema.findByIdAndUpdate(_id, rest);
};

//delete

export const deleteBook = (_id) => {
  return BookSchema.findByIdAndDelete(_id);
};
