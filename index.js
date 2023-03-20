// подключения
const fs = require('fs');
const css = require('css');
const cssParser = require('cssom');
const cheerio = require('cheerio');






/*
  анализ файла find.html и заполнение переменных данными из него
*/
function parseHtmlFile(filePath) {
  const data = fs.readFileSync(filePath);
  const $ = cheerio.load(data);

  const dataComponent = $('find').attr('data-component');
  
  const find = [];
  $('find').each(function() {
    const classes = $(this).attr('class').split(/\s+/);
    find.push(...classes);
  });
  
  const withClasses = [];
  $('replace').each(function() {
    const classes = $(this).attr('class').split(/\s+/);
    withClasses.push(...classes);
  });

  return {
    dataComponent,
    find,
    with: withClasses,
  };
}
// заполнение переменных
let parseObject = parseHtmlFile('edit/find.html');
let dataComponent = parseObject.dataComponent;
let find = parseObject.find;
let with2 = parseObject.with;



/*
  наход нужных компонентов и их замена
*/
function modifyHtmlFiles(directory, dataAttribute, classesToRemove, classesToAdd) {
  // Считываем все файлы в указанной директории
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    // Проходимся по каждому файлу
    files.forEach(file => {
      // Игнорируем не-HTML файлы
      if (!file.endsWith('.html')) return;
      const filePath = `${directory}/${file}`;
      // Считываем содержимое файла
      fs.readFile(filePath, 'utf-8', (err, html) => {
        if (err) throw err;
        // Используем cheerio для поиска нужных тегов
        const $ = cheerio.load(html);
        $(`[${dataAttribute}]`).each((i, el) => {
          const $el = $(el);
          // Проверяем, содержит ли элемент все указанные классы
          if (classesToRemove.every(className => $el.hasClass(className))) {
            // Удаляем указанные классы
            $el.removeClass(classesToRemove.join(' '));
            // Добавляем новые классы
            $el.addClass(classesToAdd.join(' '));
          }
        });
        // Сохраняем измененный HTML-файл
        fs.writeFile(filePath, $.html(), err => {
          if (err) throw err;
          console.log(`Файл ${file} изменен.`);
        });
      });
    });
  });
}

modifyHtmlFiles(
  'mykit/',
  'data-component="' + dataComponent + '"',
  find,
  with2
);

// modifyHtmlFiles(
//   'mykit/',
//   'data-component="button"',
//   ['one', 'two', 'three'],
//   ['four', 'five', 'six']
// );






































// function addNewClassToHtmlTag(filePath, dataAttr, classNames, newClassNames) {
//   const html = fs.readFileSync(filePath);
//   const $ = cheerio.load(html);

//   $(`[${dataAttr}]`).each(function() {
//     const $elem = $(this);
//     const classes = $elem.attr('class').split(' ');
//     for (let i = 0; i < classNames.length; i++) {
//       if (!classes.includes(classNames[i])) {
//         return; // элемент не содержит один из необходимых классов
//       }
//     }
//     $elem.addClass(newClassNames);
//   });

//   fs.writeFileSync(filePath, $.html(), 'utf-8');
// }

// addNewClassToHtmlTag('mykit/index.html', 'data-button-component', ['one'], 'new-class');