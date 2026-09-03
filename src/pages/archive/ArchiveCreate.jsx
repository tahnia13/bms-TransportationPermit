import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Archive,
  ArrowLeft,
  Save,
  Upload,
  FileText,
  X,
} from "lucide-react";

function ArchiveCreate() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    documentNumber: "",
    title: "",
    category: "Permit",
    documentDate: "",
    description: "",
  });

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE FILE
  // =====================================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile = () => {
    setFile(null);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Archive Data:", {
      ...formData,
      file,
    });

    alert(
      "Document berhasil ditambahkan!"
    );

    navigate("/archive");
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          text-sm
        "
      >

        <span className="text-[#8A9BB0]">
          Transportation
        </span>

        <span className="text-[#C5CDD5]">
          /
        </span>

        <span className="text-[#8A9BB0]">
          Digital Archive
        </span>

        <span className="text-[#C5CDD5]">
          /
        </span>

        <span className="text-[#12372A]">
          Add Document
        </span>

      </div>


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        {/* TITLE */}

        <div>

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#D8FF00]
                text-[#12372A]
              "
            >

              <Archive
                size={28}
                strokeWidth={2}
              />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-[#12372A]
                "
              >
                Add Document
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-[#91A0B5]
                "
              >
                Add a new document to the digital archive.
              </p>

            </div>

          </div>

        </div>


        {/* BACK BUTTON */}

        <Link
          to="/archive"
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            text-sm
            font-semibold
            text-gray-600
            transition
            hover:bg-gray-50
            hover:text-[#12372A]
          "
        >

          <ArrowLeft size={16} />

          Back to Archive

        </Link>

      </div>


      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* ===================================================
            DOCUMENT INFORMATION
        =================================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-100
            bg-white
            shadow-sm
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-gray-100
              px-5
              py-5
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-[#12372A]
              "
            >

              <FileText size={19} />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[#12372A]
                "
              >
                Document Information
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-[#91A0B5]
                "
              >
                Enter the basic information of the document.
              </p>

            </div>

          </div>


          {/* FORM CONTENT */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              p-5
              md:grid-cols-2
            "
          >

            {/* DOCUMENT NUMBER */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#12372A]
                "
              >

                Document Number

                <span className="ml-1 text-red-500">
                  *
                </span>

              </label>


              <input
                type="text"
                name="documentNumber"
                value={
                  formData.documentNumber
                }
                onChange={handleChange}
                placeholder="Example: DOC-005"
                required
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  text-sm
                  text-[#12372A]
                  outline-none
                  transition
                  placeholder:text-[#A5B1C0]
                  focus:border-[#12372A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D8FF00]/30
                "
              />

            </div>


            {/* DOCUMENT DATE */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#12372A]
                "
              >

                Document Date

                <span className="ml-1 text-red-500">
                  *
                </span>

              </label>


              <input
                type="date"
                name="documentDate"
                value={
                  formData.documentDate
                }
                onChange={handleChange}
                required
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  text-sm
                  text-[#12372A]
                  outline-none
                  transition
                  focus:border-[#12372A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D8FF00]/30
                "
              />

            </div>


            {/* DOCUMENT TITLE */}

            <div className="md:col-span-2">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#12372A]
                "
              >

                Document Title

                <span className="ml-1 text-red-500">
                  *
                </span>

              </label>


              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Vehicle Permit BM 1234 AB"
                required
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  text-sm
                  text-[#12372A]
                  outline-none
                  transition
                  placeholder:text-[#A5B1C0]
                  focus:border-[#12372A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D8FF00]/30
                "
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#12372A]
                "
              >

                Category

                <span className="ml-1 text-red-500">
                  *
                </span>

              </label>


              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  text-sm
                  text-[#12372A]
                  outline-none
                  transition
                  focus:border-[#12372A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D8FF00]/30
                "
              >

                <option value="Permit">
                  Permit
                </option>

                <option value="Vehicle">
                  Vehicle
                </option>

                <option value="Driver">
                  Driver
                </option>

                <option value="Trip">
                  Trip
                </option>

                <option value="Report">
                  Report
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* DESCRIPTION */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#12372A]
                "
              >
                Description
              </label>


              <input
                type="text"
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Short description"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  text-sm
                  text-[#12372A]
                  outline-none
                  transition
                  placeholder:text-[#A5B1C0]
                  focus:border-[#12372A]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D8FF00]/30
                "
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            FILE UPLOAD
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-100
            bg-white
            shadow-sm
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-gray-100
              px-5
              py-5
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-[#12372A]
              "
            >

              <Upload size={19} />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[#12372A]
                "
              >
                Upload Document
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-[#91A0B5]
                "
              >
                Upload the document file to store in the archive.
              </p>

            </div>

          </div>


          {/* UPLOAD AREA */}

          <div className="p-5">

            {!file ? (

              <label
                className="
                  flex
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  border-dashed
                  border-gray-200
                  bg-gray-50
                  px-6
                  py-10
                  text-center
                  transition
                  hover:border-[#12372A]
                  hover:bg-white
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#D8FF00]/30
                    text-[#12372A]
                  "
                >

                  <Upload size={24} />

                </div>


                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-[#12372A]
                  "
                >
                  Click to upload document
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-[#91A0B5]
                  "
                >
                  PDF, DOC, DOCX, JPG or PNG
                </p>


                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />

              </label>

            ) : (

              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                "
              >

                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white
                      text-[#12372A]
                    "
                  >

                    <FileText size={20} />

                  </div>


                  <div className="min-w-0">

                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-[#12372A]
                      "
                    >
                      {file.name}
                    </p>


                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-[#91A0B5]
                      "
                    >
                      {(file.size / 1024).toFixed(1)} KB
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={removeFile}
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                  "
                >

                  <X size={18} />

                </button>

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            ACTION
        ===================================================== */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          "
        >

          {/* CANCEL */}

          <Link
            to="/archive"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-gray-600
              transition
              hover:bg-gray-50
              hover:text-[#12372A]
            "
          >
            Cancel
          </Link>


          {/* SAVE */}

          <button
            type="submit"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#D8FF00]
              px-5
              text-sm
              font-semibold
              text-[#12372A]
              shadow-sm
              transition
              hover:bg-[#C8EF00]
            "
          >

            <Save size={16} />

            Save Document

          </button>

        </div>

      </form>

    </div>
  );
}

export default ArchiveCreate;