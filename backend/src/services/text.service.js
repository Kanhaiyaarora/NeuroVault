import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const loadPdfText = async (filePath) => {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join("\n\n");
};

export const splitTextToChunks = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return splitter.splitText(text);
};
