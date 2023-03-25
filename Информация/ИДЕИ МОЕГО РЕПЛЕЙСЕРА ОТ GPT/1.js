
function replaceCssProperties(component, oldProperties, newProperties) {
    // считываем файл .css 
    const cssFile = fs.readFileSync('styles.css', 'utf8');
    // разбиваем на отдельные правила
    const cssRules = cssFile.split('}');
    // создаем переменную, в которой будут храниться измененные правила
    let newCssRules = '';
    // проходимся по всем правилам
    for (let rule of cssRules) {
      // если правило содержит data-component=первый аргумент функции и хотя бы один из свойств из второго аргумента
      if (rule.includes(`data-component="${component}"`) && oldProperties.some(prop => rule.includes(prop))) {
        // разбиваем правило на массив строк, чтобы изменять его свойства
        const ruleLines = rule.split(';');
        // проходимся по каждой строке и если строка содержит свойство из второго аргумента, заменяем его на новое значение
        for (let i = 0; i < ruleLines.length - 1; i++) {
          if (oldProperties.includes(ruleLines[i].split(':')[0])) {
            ruleLines[i] = `${newProperties[oldProperties.indexOf(ruleLines[i].split(':')[0])]}:${ruleLines[i].split(':')[1]};`;
          }
        }
        // склеиваем строку правила обратно и добавляем ее в новые правила
        newCssRules += ruleLines.join(';');
        newCssRules += '}';
      } else {
        // если правило не содержит изменяемый компонент и свойства, добавляем его в новые правила без изменений
        newCssRules += rule;
        newCssRules += '}';
      }
    }
    // записываем новые правила в файл .css
    fs.writeFileSync('styles.css', newCssRules, 'utf8');
}

replaceCssProperties('button', ['color: tomato'], ['color: blue']);




  
//   `component` - строковое значение, которое нужно искать в правилах css с помощью атрибута `data-component`.
//   `oldProperties` - массив из css-свойств, которые нужно заменить.
//   `newProperties` - массив из css-свойств, на которые нужно заменить старые свойства.
  
//   Функция работает следующим образом: 
  
//    1. Считываем содержимое файла `styles.css` в переменную `cssFile`.
//    2. Разбиваем `cssFile` на отдельные правила с помощью `split('}')`.
//    3. Создаем переменную для новых правил `newCssRules`.
//    4. Проходимся по каждому правилу из `cssRules`.
//    5. Если `rule` содержит `data-component=component` и хотя бы одно из `oldProperties`, то:
//    6. Разбиваем `rule` на массив строк с помощью `split(';')`.
//    7. Проходимся по каждой строке правила с помощью цикла `for`.
//    8. Если строка содержит свойство из `oldProperties`, то заменяем его на новое значение из `newProperties`.
//    9. Склеиваем строку правила обратно с помощью `join(';')`.
//    10. Добавляем новое правило в `newCssRules`.
//    11. Если правило не содержит изменяемый компонент и свойства, добавляем его в `newCssRules` без изменений.
//    12. В итоге получаем новые правила в переменной `newCssRules`.
//    13. Записываем новые правила в файл `styles.css` с помощью `writeFileSync`.
