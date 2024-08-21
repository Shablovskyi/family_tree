document.addEventListener("DOMContentLoaded", function () {
  fetch('/src/data/data.json')
      .then(response => response.json())
      .then(data => {
          const familyTreeContainer = document.getElementById("family-tree");
          let currentTree = null;
          let mainTree = null;

          function buildTree(person, level = 0) {
              // Отримуємо дати народження і смерті або ставимо прочерк, якщо вони відсутні
              const birthDate = person.birthDate || '—';
              const deathDate = person.deathDate || '—';

              let listItem = `<li data-level="${level}" data-id="${person.id}">
                  <a href="#" data-gender="${person.gender}" data-id="${person.id}" data-surname="${person.surname}" class="person">
                      ${person.name} (${birthDate} - ${deathDate})
                  </a>`;
              
              if (person.wife) {
                  const wifeBirthDate = person.wife.birthDate || '—';
                  const wifeDeathDate = person.wife.deathDate || '—';
                  listItem += ` <span style="color: #888;">&mdash;</span> 
                  <a href="#" class="spouse" data-id="${person.wife.id}" data-surname="${person.wife.surname}" data-gender="female">
                      ${person.wife.name} (${wifeBirthDate} - ${wifeDeathDate})
                  </a>`;
              } else if (person.husband) {
                  const husbandBirthDate = person.husband.birthDate || '—';
                  const husbandDeathDate = person.husband.deathDate || '—';
                  listItem += ` <span style="color: #888;">&mdash;</span> 
                  <a href="#" class="spouse" data-id="${person.husband.id}" data-surname="${person.husband.surname}" data-gender="male">
                      ${person.husband.name} (${husbandBirthDate} - ${husbandDeathDate})
                  </a>`;
              }

              if (person.children && person.children.length > 0) {
                  listItem += `<ul>`;
                  person.children.forEach(child => {
                      listItem += buildTree(child, level + 1);
                  });
                  listItem += `</ul>`;
              }

              listItem += `</li>`;
              return listItem;
          }

          function findFamilyById(id) {
              for (let branch of data) {
                  if (branch.treeData.id == id) {
                      return branch.treeData;
                  }
                  if (branch.treeData.children) {
                      let result = findPersonById(branch.treeData.children, id);
                      if (result) return result;
                  }
              }
              return null;
          }

          function findPersonById(children, id) {
              for (let child of children) {
                  if (child.id == id) {
                      return child;
                  }
                  if (child.children) {
                      let result = findPersonById(child.children, id);
                      if (result) return result;
                  }
              }
              return null;
          }

          function buildFamilyBlock(person) {
              let familyBlock = `<div class="family-block">`;

              // Батьки
              if (person.father || person.mother) {
                  familyBlock += `<div class="parents"><h3>Батьки:</h3><ul>`;
                  if (person.father) {
                      const fatherBirthDate = person.father.birthDate || '—';
                      const fatherDeathDate = person.father.deathDate || '—';
                      familyBlock += `<li><span class="relation-label">Батько:</span> <a href="#" data-id="${person.father.id}" class="person">
                          ${person.father.name} ${person.father.surname} (${fatherBirthDate} - ${fatherDeathDate})
                      </a></li>`;
                  }
                  if (person.mother) {
                      const motherBirthDate = person.mother.birthDate || '—';
                      const motherDeathDate = person.mother.deathDate || '—';
                      familyBlock += `<li><span class="relation-label">Мати:</span> <a href="#" data-id="${person.mother.id}" class="person">
                          ${person.mother.name} ${person.mother.surname} (${motherBirthDate} - ${motherDeathDate})
                      </a></li>`;
                  }
                  familyBlock += `</ul></div>`;
              }

              // Брати/Сестри
              if (person.siblings && person.siblings.length > 0) {
                  familyBlock += `<div class="siblings"><h3>Брати/Сестри:</h3><ul>`;
                  person.siblings.forEach(sibling => {
                      const siblingBirthDate = sibling.birthDate || '—';
                      const siblingDeathDate = sibling.deathDate || '—';
                      familyBlock += `<li><span class="relation-label">Брат/Сестра:</span> <a href="#" data-id="${sibling.id}" class="person">
                          ${sibling.name} ${sibling.surname} (${siblingBirthDate} - ${siblingDeathDate})
                      </a></li>`;
                  });
                  familyBlock += `</ul></div>`;
              }

              familyBlock += `</div>`;
              return familyBlock;
          }

          function updateTree(person, isMainTree = false, branchTitle = "") {
              let treeHTML = branchTitle ? `<h2>${branchTitle}</h2>` : "";
              treeHTML += `<ul class="tree-branch">${buildTree(person)}</ul>`;
              familyTreeContainer.innerHTML = treeHTML;

              if (person.father || person.mother || (person.siblings && person.siblings.length > 0)) {
                  const familyBlockHTML = buildFamilyBlock(person);
                  familyTreeContainer.insertAdjacentHTML('beforeend', familyBlockHTML);
              }

              if (!isMainTree && currentTree) {
                  const backButtonHTML = `<button id="back-to-main">Повернутись до основної гілки</button>`;
                  familyTreeContainer.insertAdjacentHTML('beforeend', backButtonHTML);
              }
          }

          function openIgnatenkoBranch() {
              const ignatenkoBranch = data.find(branch => branch.treeBranch === "Гілка Ігнатенків");
              if (ignatenkoBranch) {
                  currentTree = ignatenkoBranch.treeData;
                  updateTree(ignatenkoBranch.treeData, false, "Гілка Ігнатенків");
              }
          }

          function openProkhorovBranch() {
              const prokhorovBranch = data.find(branch => branch.treeBranch === "Гілка Прохорових");
              if (prokhorovBranch) {
                  currentTree = prokhorovBranch.treeData;
                  updateTree(prokhorovBranch.treeData, false, "Гілка Прохорових");
              }
          }

          function openReshetyloBranch() {
              const reshetyloBranch = data.find(branch => branch.treeBranch === "Гілка Решетелів");
              if (reshetyloBranch) {
                  currentTree = reshetyloBranch.treeData;
                  updateTree(reshetyloBranch.treeData, false, "Гілка Решетелів");
              }
          }

          function openMiskyBranch() {
              const miskyBranch = data.find(branch => branch.treeBranch === "Гілка Місків");
              if (miskyBranch) {
                  currentTree = miskyBranch.treeData;
                  updateTree(miskyBranch.treeData, false, "Гілка Місків");
              }
          }

          mainTree = data[0].treeData;
          currentTree = mainTree;
          updateTree(mainTree, true, "Основна гілка родини Шабльовських");

          familyTreeContainer.addEventListener("click", function(event) {
              if (event.target.classList.contains("spouse") && event.target.getAttribute("data-gender") === "female") {
                  event.preventDefault();
                  let personId = event.target.getAttribute("data-id");
                  let person = findFamilyById(personId);
                  if (person) {
                      if (person.surname === "Ігнатенко") {
                          openIgnatenkoBranch();
                      } else if (person.surname === "Прохорова") {
                          openProkhorovBranch();
                      } else if (person.surname === "Решетило") {
                          openReshetyloBranch();
                      } else if (person.surname === "Міскі") {
                          openMiskyBranch();
                      } else {
                          currentTree = person;
                          updateTree(person);
                      }
                  }
              }
          });

          familyTreeContainer.addEventListener("click", function(event) {
              if (event.target.id === "back-to-main") {
                  event.preventDefault();
                  currentTree = mainTree;
                  updateTree(mainTree, true, "Основна гілка родини Шабльовських");
              }
          });
      })
      .catch(error => console.error('Error:', error));
});