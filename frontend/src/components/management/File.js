import React from "react";
import ViewFileModal from "./ViewFileModal";
import DeleteFileModal from "./DeleteFileModal";
import EditFileForm from "./EditFileModal";
import {downloadFile} from "../../helpers/downloadHelper";
import Button from "../Button";
import "../../css/file.css";

class File extends React.Component {
  state = {
    viewFileContents: false,
    fileContents: '',
    showEditForm: false,
    confirmDeleteModal: false,
  };

  getFileContents = async (contents) => {
    if(contents) this.setState({fileContents: contents})

    try {
      const response = await fetch(`/${this.props.fileName}?api=true`);
      const data = await response.json();
      
      this.setState({fileContents: data.file});
      return data.file;
    } catch (e) {
      console.log(e);
      console.log("Error!");
    }
  };

  showFileContents = async () => {
    await this.getFileContents();
    if (this.state.viewFileContents) {
      this.setState({ viewFileContents: false });
    } else {
      this.setState({ viewFileContents: true }); 
    }
  };

  FileContentsModal = () => {
    if (this.state.viewFileContents) {
      return (
        <ViewFileModal
          fileContents={this.state.fileContents}
          toggleModal={this.showFileContents}
          showModal={this.state.viewFileContents}
        />
      )
    }
  };

  editFormToggle = async () => {
    await this.getFileContents();
    this.state.showEditForm ? this.setState({ showEditForm: false }) : this.setState({ showEditForm: true });
  };

  editFile = async (file, fileName, contents) => {
    // clears text if user removes/deletes all content
    if (contents === '') {
      this.setState({fileContents: ''})
    } else {
      const url = `/${fileName}?api=true`;

      try {
        const formData = new FormData();
        const FileAdded = file;
  
        formData.append("file", FileAdded);
  
        const sendFile = await fetch(url, {
          method: "put",
          body: formData
        });
  
        const data = await sendFile;
        console.log(data);
        
        this.getFileContents(contents);
      } catch (event) {
        console.log("Error!", event);
      }
    } 
  };

  EditFileModal = () => {
    if (this.state.showEditForm) {
      return (
        <EditFileForm
        fileContents={this.state.fileContents}
        editFile={this.editFile}
        fileName={this.props.fileName}
        editFormToggle={this.editFormToggle}
      />
      )
    }
  };

  deleteModalToggle = () => {
    if (this.state.confirmDeleteModal) {
      this.setState({ confirmDeleteModal: false });
    } else {
      this.setState({ confirmDeleteModal: true });
    }
  }

  DeleteFileModal = () => {
    if (this.state.confirmDeleteModal) {
      return (
        <DeleteFileModal 
          toggleModal={this.deleteModalToggle}
          showModal={this.state.confirmDeleteModal}
          deleteFile={this.props.deleteFile}
          fileName={this.props.fileName}
          getFileNames={this.props.getFileNames}
        />
      )
    }
  }

  render() {
    return (
      <div className="file">
        <p className="input-label">{this.props.fileName}</p>
        <div className="buttons">
          <span className="bracket">></span>
          <Button
            function={downloadFile}
            argument1={`${this.props.fileName}.txt`}
            argument2={this.getFileContents}
            styles="base green"
            buttontext="Download"
          />
          <Button 
            function={this.showFileContents}
            styles="base blue"
            buttontext="View"
          />
          <Button
            function={this.editFormToggle}
            styles="base blue"
            buttontext="Edit"
          />
          <Button 
            function={this.deleteModalToggle}
            styles="base white"
            buttontext="Delete"
          />
        </div>
        {this.FileContentsModal()}
        {this.EditFileModal()}
        {this.DeleteFileModal()}
      </div>
    );
  }
}

export default File;
