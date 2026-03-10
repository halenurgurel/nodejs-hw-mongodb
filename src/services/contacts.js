import { ContactCollection } from '../db/models/contact.js';

//GET all contacts
export const getAllContacts = async () => {
  const contacts = await ContactCollection.find();
  return contacts;
};

//GET contact by id
export const getContactsById = async (contactId) => {
  const contact = await ContactCollection.findById(contactId);
  return contact;
};

//POST - create contact
//payload is the new contact's value and it will be saved to mongodb
export const createContact = async (payload) => {
  const contact = await ContactCollection.create(payload);
  return contact;
};

//PATCH - update contact
export const updateContact = async (contactId, payload) => {
  const contact = await ContactCollection.findByIdAndUpdate(
    contactId, //finds the document by its id
    payload, //fields to update
    { new: true }, //by default mongoose returns the old document before the update. new: true makes it return the updated document instead.
  );
  return contact;
};

//DELETE contact
export const deleteContact = async (contactId) => {
  const contact = await ContactCollection.findByIdAndDelete(contactId);
  return contact;
};
