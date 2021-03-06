const mongoose = require('mongoose');

const User = mongoose.model('User');
const File = mongoose.model('File');

exports.getAllFiles = async (req, res) => {
  const user = await User.findById(req.user.id).populate('files').exec();
  const fileNames = user.files.map((file) => file.name);
  res.json(fileNames);
};

exports.getAllFilesCli = async (req, res) => {
  const user = await User.findById(req.user.id).populate('files').exec();
  const fileNames = user.files.map((file) => file.name);
  res.send(JSON.stringify(fileNames) + '\n');
};

exports.getFile = async (req, res, next) => {
  const file = await File.findOne({ user: req.user.id, name: req.params.file }).exec();
  if (!file) {
    return next();
  }
  return res.json({ file: file.contents });
};

exports.getFileCli = async (req, res, next) => {
  const file = await File.findOne({ user: req.user.id, name: req.params.file }).exec();
  if (!file) {
    return res.status(404).send("File Not Found\n");
  }

  return res.send(file.contents);
};

exports.addFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('err_no_file_attached\n');
  }

  const fileContents = req.file.buffer.toString();
  if (fileContents === '') {
    return res.status(400).send('err_empty_file_attached\n');
  }

  const user = await User.findById(req.user.id).populate('files').exec();
  const existingUserFileNames = user.files.map((file) => file.name);

  if (!existingUserFileNames.includes(req.params.file)) {
    const file = new File({
      name: req.params.file,
      contents: fileContents,
      user: user.id,
    });

    await file.save();
    await user.addFile(file);
    await user.save();

    res.status(201).send('Created Successfully\n');
  } else {
    res.status(400).send('err_file_already_exists\n');
  }
};

exports.upsertFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('err_no_file_attached\n');
  }

  const fileContents = req.file.buffer.toString();
  if (fileContents === '') {
    return res.status(400).send('err_empty_file_attached\n');
  }

  const userPromise = User.findById(req.user.id).populate('files').exec();
  const filePromise = File.findOneAndUpdate(
    { user: req.user.id, name: req.params.file },
    { contents: fileContents },
    { new: true, upsert: true },
  ).exec();

  const [user, file] = await Promise.all([userPromise, filePromise]);
  const fileWasAdded = await user.addFile(file);

  res.status(200);
  return fileWasAdded ? res.send('file_added\n') : res.send('file_updated\n');
};

exports.deleteFile = async (req, res) => {
  const user = await User.findById(req.user.id).populate('files');

  const fileToRemove = user.files.find((file) => file.name === req.params.file);
  const filesToKeep = user.files.filter((file) => file.name !== req.params.file);

  if (!fileToRemove) {
    return res.status(404).send("File Not Found\n");
  }

  user.files = filesToKeep;
  await fileToRemove.remove();
  await user.save();

  res.status(200).send("File Deleted\n");
};
