import DataUriParser from 'datauri/parser.js';
import path from 'path';

const getDataUri = (file) => {
  const parser = new DataUriParser();

  // Extract file extension (e.g., '.pdf') and remove the dot
  const extName = path.extname(file.originalname).slice(1); // 'pdf'

  // Format the file into a Data URI with correct MIME type
  const dataUri = parser.format(extName, file.buffer);

  // Return the actual Data URI string (data:application/pdf;base64,...)
  return dataUri.content;
};

export default getDataUri;
