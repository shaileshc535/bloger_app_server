import { Response } from "express";
import BlogCategoryModel from "../../model/BlogCategoryModel";

export interface IBlogCategory {
  category_name: string;
  category_type: string;
  category_description: string;
  isactive: boolean;
  isdeleted: boolean;
}

const CreateBlogCategory = async (req, res: Response) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        message: "You are not authorized to create blog category",
      });
    }

    const { category_name, category_type } = req.body;

    if (!category_name) {
      return res.status(400).json({
        message: "Blog Category Name is required",
      });
    }

    if (!category_type) {
      return res.status(400).json({
        message: "Blog Category Type is required",
      });
    }

    const BlogCategory = new BlogCategoryModel({ ...req.body });

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
      message: error.message,
    });
  }
};

const ListBlogCategory = async (req, res: Response) => {
  try {
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
          $and: [
            cond,
            {
              $or: [{ category_name: { $regex: search, $options: "i" } }],
            },
          ],
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

    const result = await BlogCategoryModel.aggregate(cond);

    let totalPages = 0;
    if (result[0].total.length != 0) {
      totalPages = Math.ceil(result[0].total[0].count / limit);
    }

    return res.status(200).json({
      status: 200,
      type: "success",
      message: "Blog Category Fetch Successfully",
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

const DeleteBlogCategory = async (req, res: Response) => {
  try {
    const { id } = req.body;

    const blogData = await BlogCategoryModel.findOne({
      _id: id,
      isdeleted: false,
    });

    if (!blogData) {
      return res.status(400).json({
        type: "error",
        status: 400,
        message: "Blog Category not found",
      });
    }

    // const blog = JSON.parse(JSON.stringify(fileData));

    const requestData = {
      isdeleted: true,
      deleted_at: Date.now(),
    };

    await BlogCategoryModel.findByIdAndUpdate(
      {
        _id: id,
      },
      requestData
    );

    res.status(200).json({
      type: "success",
      status: 200,
      message: "Blog Category Deleted successfully",
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
  CreateBlogCategory,
  ListBlogCategory,
  DeleteBlogCategory,
};
