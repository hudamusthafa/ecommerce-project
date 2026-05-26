const categoryService = require("../services/categoryService");


// CATEGORY LIST PAGE
exports.getCategories = async (req, res) => {

  try {

        // SEARCH 
        const search = req.query.search || "";

        // PAGINATION
        const page = parseInt(req.query.page) || 1;
        const limit = 4;

        // SERVICE
        const result = await categoryService.getCategories(
          search,
          page,
          limit
        );

        // RENDER
        res.render("admin/categories", {
          categories: result.categories,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: page,
          search
        });

  } catch (error) {

        console.log(error);
        res.redirect("/admin/dashboard");

  }

};


// GET ADD CATEGORY PAGE
exports.getAddCategory = (req, res) => {

      res.render("admin/add-category", {
        error: null
      });

};


// ADD CATEGORY
exports.addCategory = async (req, res) => {

  try {

        const { name, description } = req.body;

        // VALIDATION
        if (!name || name.trim() === "") {

          return res.render("admin/add-category", {
            error: "Category name is required"
          });

        }
        const existingCategory =
            await categoryService.getCategoryByName(name);

          if (existingCategory) {

            return res.render("admin/add-category", {
              error: "Category already exists"
            });

          }


        // SAVE
        await categoryService.addCategory({
          name,
          description
        });

        res.redirect("/admin/categories");

  } catch (error) {

        console.log(error);
        res.redirect("/admin/categories");

  }

};


// GET EDIT CATEGORY PAGE
exports.getEditCategory = async (req, res) => {

  try {

      const category = await categoryService.getCategoryById(
        req.params.id
      );

      if (!category) {
        return res.redirect("/admin/categories");
      }

      res.render("admin/edit-category", {
        category,
        error: null
      });

  } catch (error) {

      console.log(error);
      res.redirect("/admin/categories");

  }

};


// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {

  try {

        const { name, description } = req.body;

        // VALIDATION
        if (!name || name.trim() === "") {

          const category = await categoryService.getCategoryById(
            req.params.id
          );

          return res.render("admin/edit-category", {
            category,
            error: "Category name is required"
          });

        }
          // CHECK DUPLICATE CATEGORY
          const existingCategory =
            await categoryService.getCategoryByName(name);

          if (
            existingCategory &&
            existingCategory._id.toString() !== req.params.id
          ) {

            const category =
              await categoryService.getCategoryById(
                req.params.id
              );

            return res.render("admin/edit-category", {

              category,
              error: "Category already exists"

            });

          }

        // UPDATE
        await categoryService.updateCategory(
          req.params.id,
          {
            name,
            description
          }
        );
        res.redirect("/admin/categories");

  } catch (error) {

        console.log(error);
        res.redirect("/admin/categories");

  }

};


// SOFT DELETE CATEGORY
exports.deleteCategory = async (req, res) => {

  try {

        await categoryService.softDeleteCategory(
          req.params.id
        );

        res.redirect("/admin/categories");

  } catch (error) {

        console.log(error);
        res.redirect("/admin/categories");

  }

};