// подключения
const fs = require('fs');
const cheerio = require('cheerio');



/*
  1. анализ файла find.html и заполнение переменных данными из него
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
  2. наход нужных компонентов и их замена
*/
function modifyHtmlFiles(directory, dataAttribute, classesToRemove, classesToAdd) {
  // Считываем все файлы в указанной директории
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    // Проходимся по каждому файлу
    files.forEach(file => {
      // Игнорируем не-HTML файлы
      if (!file.endsWith('.html') && !file.endsWith('.php') && !file.endsWith('.blade')) return;
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


// mykit/
modifyHtmlFiles(
  'mykit/',
  'data-component="' + dataComponent + '"',
  find,
  with2
);
// mykit/inner/
modifyHtmlFiles(
  'mykit/inner/',
  'data-component="' + dataComponent + '"',
  find,
  with2
);



/* Вид аргументов

  modifyHtmlFiles(
    'mykit/',
    'data-component="button"',
    ['one', 'two', 'three'],
    ['four', 'five', 'six']
  );

*/