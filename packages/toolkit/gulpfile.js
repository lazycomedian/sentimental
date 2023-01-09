const gulp = require("gulp");
const commonConfig = require("../../gulpfile");

gulp.task("copyREADME", async function () {
  gulp.src("../../README.md").pipe(gulp.dest("./"));
});

exports.default = gulp.series(commonConfig.default, "copyREADME");
