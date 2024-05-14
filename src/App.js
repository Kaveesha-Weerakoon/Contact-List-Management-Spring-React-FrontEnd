import { seEffect, useState, useRef, useEffect } from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css'; import { getContacts, saveContact, updatePhoto, deleteContact } from './api/ContactService'
import Header from './components/Header'
import ContactList from './components/ContactList'
import { Route, Routes, Router, Navigate, useNavigate } from 'react-router-dom';
import ContactDetail from './components/ContactDetail';
import { toastError } from './api/ToastService';
import { toastSuccess } from './api/ToastService';
import { ToastContainer } from 'react-toastify';
function App() {

  const modelRef = useRef();
  const fileRef = useRef();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  const [file, setFile] = useState(undefined);


  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    status: '',
  });

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  const getAllContacts = async (page = 0, size = 10) => {
    try {
      setCurrentPage(page);
      const { data } = await getContacts(page, size);
      setData(data);
    } catch (error) {
      toastError(error.message);
      fileRef.current.value = undefined;
    }
  }

  const handleNewContact = async (event) => {
    event.preventDefault();
    try {
      const { data } = await saveContact(values);

      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('id', data.id);

      const { data: photoUrl } = await updatePhoto(formData);
      toggleModal(false);
      setFile(undefined);
      fileRef.current.value = null;
      setValues({
        name: '',
        email: '',
        phone: '',
        address: '',
        title: '',
        status: '',
      })
      console.log(data);
      getAllContacts();
    } catch (error) {
      toastError(error.message);
    }
  };

  const toggleModal = (show) => show ? modelRef.current.showModal() : modelRef.current.close();

  const updateContact = async (contact) => {
    try {
      await saveContact(contact);
      getAllContacts();
      toastSuccess('Updated Succesfully');


    }
    catch (error) {
      toastError(error.message);
    }
  }

  const updateImage = async (formData) => {
    try {
      const { data: photoUrl } = await updatePhoto(formData);

      getAllContacts();

    } catch (error) {
      toastError(error.message);
    }
  }

  const deleteCont = async (id) => {
    try {
      await deleteContact(id);
      getAllContacts();
      navigate("/");
    } catch (error) {
      toastError(error.message);
    }
  }

  useEffect(() => {
    getAllContacts();
  }, [])

  return (
    <div className="App">
      {<Header toggleModal={toggleModal} nbOfContacts={data.totalElements} />}
      <main className='main'>
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to={'/contacts'} />} />
            <Route path="/contacts" element={<ContactList data={data} currentPage={currentPage} getAllContacts={getAllContacts} />} />
            <Route path="/contacts/:id" element={<ContactDetail data={data} updateContact={updateContact} updateImage={updateImage} deleteCont={deleteCont} />} />

          </Routes>
        </div>

      </main>
      <dialog ref={modelRef} className="modal" id="modal">
        <div className="modal__header">
          <h3>New Contact</h3>
          <i onClick={() => toggleModal(false)} className="bi bi-x-lg"></i>
        </div>
        <div className="divider"></div>
        <div className="modal__body">
          <form onSubmit={handleNewContact}>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Name</span>
                <input value={values.name} onChange={onChange} type="text" name='name' required />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input type="text" value={values.email} onChange={onChange} name='email' required />
              </div>
              <div className="input-box">
                <span className="details">Title</span>
                <input type="text" value={values.title} onChange={onChange} name='title' required />
              </div>
              <div className="input-box">
                <span className="details">Phone Number</span>
                <input type="text" value={values.phone} onChange={onChange} name='phone' required />
              </div>
              <div className="input-box">
                <span className="details">Address</span>
                <input type="text" value={values.address} onChange={onChange} name='address' required />
              </div>
              <div className="input-box">
                <span className="details">Account Status</span>
                <input type="text" value={values.status} onChange={onChange} name='status' required />
              </div>
              <div className="file-input">
                <span className="details">Profile Photo</span>
                <input
                  ref={fileRef}
                  type="file"
                  onChange={(event) => {
                    setFile(event.target.files[0]);
                  }}
                  value={values.photo}
                  name='photo'
                  required
                />
              </div>
            </div>
            <div className="form_footer">
              <button onClick={() => toggleModal(false)} type='button' className="btn btn-danger">Cancel</button>
              <button type='submit' className="btn">Save</button>
            </div>
          </form>
        </div>
      </dialog>
      <ToastContainer />
    </div>
  );
}

export default App;
