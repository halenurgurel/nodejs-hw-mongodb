import { ContactCollection } from '../db/models/contact.js';

//GET all contacts
export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter = {},
  userId,
}) => {
  //calculate how many documents to skip
  const skip = (page - 1) * perPage;

  //filter
  const contactsQuery = ContactCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [contacts, totalItems] = await Promise.all([
    contactsQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
    ContactCollection.countDocuments({ ...filter, userId }),
  ]);
  return { contacts, totalItems };
};

//GET contact by id
export const getContactsById = async (contactId, userId) => {
  const contact = await ContactCollection.findOne({ _id: contactId, userId });
  return contact;
};

//POST - create contact
//payload is the new contact's value and it will be saved to mongodb
export const createContact = async (payload) => {
  const contact = await ContactCollection.create(payload);
  return contact;
};

//PATCH - update contact
export const updateContact = async (contactId, userId, payload) => {
  const contact = await ContactCollection.findByIdAndUpdate(
    {
      _id: contactId, //finds the document by its id
      userId,
    },
    payload, //fields to update
    { new: true }, //by default mongoose returns the old document before the update. new: true makes it return the updated document instead.
  );
  return contact;
};

//DELETE contact
export const deleteContact = async (contactId, userId) => {
  const contact = await ContactCollection.findByIdAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};
