import { Response } from "express";
import BlogCategoryModel from "../../model/BlogCategoryModel";
import BlogModel from "../../model/BlogModel";
import UserModel from "../../model/user";
import mongoose from "mongoose";

const ObjectId = <any>mongoose.Types.ObjectId;

export interface IBlogCategory {
  blog_owner: string;
  blog_category: string;
  blog_name: string;
  title: string;
  post_body: string;
  post_summary: string;
  blog_image: string;
}

const CreateBlog = async (req, res: Response) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        message: "You are not authorized to create blog category",
      });
    }

    const user = JSON.parse(JSON.stringify(req.user));

    if (req.body.blog_category == undefined) {
      return res.status(400).json({
        message: "blog category is required",
      });
    }
    if (req.body.name == undefined) {
      return res.status(400).json({
        message: "blog name is required",
      });
    }
    if (req.body.title == undefined) {
      return res.status(400).json({
        message: "blog title is required",
      });
    }

    const BlogCategoryData = await BlogCategoryModel.findOne({
      _id: req.body.blog_category,
      isdeleted: false,
    });

    if (!BlogCategoryData) {
      return res.status(400).json({
        type: "error",
        status: 400,
        message: "Blog Category is not available",
      });
    }

    const base_url = process.env.BASE_URL;
    const file_url = base_url + "/public/" + req.file.filename;

    const BlogCategory = new BlogModel({
      blog_owner: user._id,
      blog_category: BlogCategoryData._id,
      blog_name: req.body.name,
      title: req.body.title,
      post_body: req.body.post_body,
      post_summary: req.body.post_summary,
      blog_image: file_url,
    });

    const data = await BlogCategory.save();

    res.status(200).json({
      status: 200,
      type: "success",
      message: "User Registration Successfully",
      data: {
        ...data.toObject(),
      },
    });
  } catch (error) {
    return res.status(404).json({
      type: "error",
      status: 404,
      message: error,
    });
  }
};

const ListBlogs = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    let { page, limit, sort, cond, paginate } = req.body;

    let search = "";

    if (paginate == undefined) {
      paginate = true;
    }
    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    if (!cond) {
      cond = {};
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }
    if (typeof cond.search != "undefined" && cond.search != null) {
      search = String(cond.search);
      delete cond.search;
    }

    cond = [
      {
        $match: {
          isdeleted: false,
          isactive: true,
          blog_owner: ObjectId(user._id),
          $and: [
            cond,
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: UserModel.collection.name,
          localField: "blog_owner",
          foreignField: "_id",
          as: "blog_owner",
        },
      },
      {
        $lookup: {
          from: BlogCategoryModel.collection.name,
          localField: "blog_category",
          foreignField: "_id",
          as: "blog_category",
        },
      },
      { $sort: sort },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    ];

    limit = parseInt(limit);

    const result = await BlogModel.aggregate(cond);

    let totalPages = 0;
    if (result[0].total.length != 0) {
      totalPages = Math.ceil(result[0].total[0].count / limit);
    }

    return res.status(200).json({
      status: 200,
      type: "success",
      message: "Blogs List Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result[0].total.length != 0 ? result[0].total[0].count : 0,
      data: result[0].data,
    });
  } catch (error) {
    return res.status(404).json({
      type: "error",
      status: 404,
      message: error.message,
    });
  }
};

const GetBlogById = async (req, res: Response) => {
  try {
    // const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.id;

    const result = await BlogModel.find({
      _id: id,
      isdeleted: false,
      isactive: true,
    })
      .populate("blog_owner")
      .populate("blog_category");

    if (result.length < 1) {
      return res.status(400).json({
        type: "error",
        status: 400,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: 200,
      type: "success",
      message: "File Fetched Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      type: "error",
      status: 404,
      message: error.message,
    });
  }
};

const DeleteBlog = async (req, res: Response) => {
  try {
    const { id } = req.body;

    const blogData = await BlogModel.findOne({
      _id: id,
      isdeleted: false,
    });

    if (!blogData) {
      return res.status(400).json({
        type: "error",
        status: 400,
        message: "Blog not found",
      });
    }

    // const blog = JSON.parse(JSON.stringify(fileData));

    const requestData = {
      isdeleted: true,
      deleted_at: Date.now(),
    };

    await BlogModel.findByIdAndUpdate(
      {
        _id: id,
      },
      requestData
    );

    res.status(200).json({
      type: "success",
      status: 200,
      message: "Blog Deleted successfully",
      data: "",
    });
  } catch (error) {
    return res.status(404).json({
      type: "error",
      status: 404,
      message: error.message,
    });
  }
};

export default {
  CreateBlog,
  ListBlogs,
  GetBlogById,
  DeleteBlog,
};
