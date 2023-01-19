const gulp = require("gulp");
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const babel = require("gulp-babel");

gulp.task("clean", function () {
  return gulp.src(["lib", "es", "README.md"], { read: false, allowEmpty: true }).pipe(clean());
});

gulp.task("es", function () {
  const tsProject = ts.createProject("tsconfig.build.json", {
    module: "ESNext"
  });
  return tsProject.src().pipe(tsProject()).pipe(babel()).pipe(gulp.dest("es/"));
});

gulp.task("cjs", function () {
  return gulp
    .src(["./es/**/*.js"])
    .pipe(babel({ configFile: "../../.babelrc" }))
    .pipe(gulp.dest("lib/"));
});

gulp.task("tsc", function () {
  const tsProject = ts.createProject("tsconfig.build.json", {
    declaration: true,
    emitDeclarationOnly: true
  });
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest("es/")).pipe(gulp.dest("lib/"));
});

exports.default = gulp.series("clean", "es", "cjs", "tsc");
