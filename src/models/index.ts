import mongoose from 'mongoose';

mongoose.connect(
  'mongodb+srv://test:tRSpcaCAiBYGKEy5@cluster0.xtp0l.mongodb.net/Cluster0?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
).catch((e) => console.log(e));

export default mongoose;
