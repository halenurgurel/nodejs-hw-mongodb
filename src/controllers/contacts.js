import {
  createContact,
  getAllContacts,
  getContactsById,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

//GET 200 all contacts
export const getAllContactsController = async (req, res) => {
  //pagination
  const { page, perPage } = parsePaginationParams(req.query);

  //sort
  const { sortBy, sortOrder } = parseSortParams(req.query);

  //filter
  const filter = parseFilterParams(req.query);

  const { contacts, totalItems } = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId: req.user._id,
  });
  const paginationData = calculatePaginationData(totalItems, page, perPage);

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page,
      perPage,
      totalItems,
      ...paginationData,
    },
  });
};

//GET 200 contacts by id
export const getContactsByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactsById(contactId, req.user._id);

  //if contact cannot be found
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}`,
    data: contact,
  });
};

//POST 201 - create contact
//req.body containt json data sent by the client and parsed by express
export const createContactController = async (req, res) => {
  const contact = await createContact({ ...req.body, userId: req.user._id });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact',
    data: contact,
  });
};

//PATCH 200 - update contact
export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await updateContact(contactId, req.user._id, req.body);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: contact,
  });
};

//DELETE 204 - delete contact
export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send();
};
//by filtering with both _id and userId in the service layer, a user trying to access another user's contact will simply get null back, resulting 404, not a security leak
