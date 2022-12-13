const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Getting details of the User Post through aggregation
    let getUser = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          posts: { $size: "$posts" },
        },
      },
    ]);
     // For Pagination
     page = Number(page);
     limit = Number(limit);
 
     // If we do not receive page and limit inside Query
     let pagination = {
       totalDocs: getUser.length,
       limit: limit ? limit : null,
       page: page ? page : null,
       totalPages: 1,
       pagingCounter: 1,
       hasPrevPage: false,
       hasNextPage: false,
       prevPage: null,
       nextPage: null,
     };
 
 
     let startIndex, endIndex;
     let users = getUser;
 
     // if we recieve page and limit inside the 
     if (page && limit) {
       startIndex = page * limit - limit;
       endIndex = page * limit - 1;
       users = getUser.slice(startIndex, endIndex + 1);
       pagination.totalPages = Math.ceil(getUser.length / limit);
       pagination.hasPrevPage = page > 1;
       pagination.hasNextPage =
         page == Math.ceil(getUser.length / limit) ? false : true;
       pagination.prevPage = page > 1 ? page - 1 : null;
       pagination.nextPage =
         page < Math.ceil(getUser.length / limit) ? page + 1 : null;
     }
    

   

    res.status(200).json({
        data: { users, pagination },
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
