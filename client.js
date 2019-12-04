$(document).ready(function() {
  console.log("jQuery loaded");

  // Arrays for champions that have the same class and origin
  let doubleChamps = [];
  let tripleChamps = [];

  fixData();
  setChampsArray();
  willAllPopulate();
  buildFirstRow();
  buildRemainingRows();
  populateTheGrid();

  // Riot API has a lot of bad data. Here we make the necessary corrections.
  function fixData() {
    console.log("Fixing bad data..");
    let foundIndex = -1;

    // fix Kindred
    foundIndex = champs.findIndex(x => x.champion === "Kindred");
    champs[foundIndex].traits = ["Inferno", "Shadow", "Ranger"];

    // fix Khazix
    foundIndex = champs.findIndex(x => x.champion === "KhaZix");
    champs[foundIndex].champion = "Khazix";

    // fix Leblanc
    foundIndex = champs.findIndex(x => x.champion === "LeBlanc");
    champs[foundIndex].champion = "Leblanc";
    champs[foundIndex].traits = ["Woodland", "Assassin", "Mage"];

    // fix MasterYi
    foundIndex = champs.findIndex(x => x.champion === "MasterYi");
    champs[foundIndex].traits = ["Shadow", "Mystic", "Blademaster"];

    // fix Qiyana
    foundIndex = champs.findIndex(x => x.champion === "Qiyana");
    champs[foundIndex].traits = [
      "Ocean",
      "Inferno",
      "Cloud",
      "Mountain",
      "Assassin"
    ];

    // fix Volibear
    foundIndex = champs.findIndex(x => x.champion === "Volibear");
    champs[foundIndex].traits = ["Glacial", "Electric", "Berserker"];

    // fix Electric trait
    foundIndex = traits.findIndex(x => x.name === "Eletric");
    traits[foundIndex].name = "Electric";

    // fix Berserker trait
    foundIndex = traits.findIndex(x => x.name === "Beserker");
    traits[foundIndex].name = "Berserker";
  }

  // Runs through the origins array, creating the column head with tootip and unit requirement for buff
  function buildFirstRow() {
    $("#tableContainer").append(
      "<div class='origins-row row'><div class='icon-cell cell'/></div>"
    );

    for (let i = 0; i < origins.length; i++) {
      traitIndex = traits.findIndex(trait => trait.name == origins[i]);
      console.log(traits[traitIndex]);
      $(".origins-row").append(
        `<div class='cell icon-cell tooltip'><span class='tooltiptext top'>${
          traits[traitIndex].description
        }</span><img class='icon ${
          traits[traitIndex].name
        }' src='resources/trait_icons/${origins[i]}.png'/><div>${origins[i] +
          " " +
          displaySets(traitIndex)}</div></div>`
      );
    }
  }

  // Returns number of champions required for origin/class buff
  function displaySets(i) {
    if (traits[i].sets) {
      return `<span class="set">[${traits[i].sets[0]}]</span>`;
    } else {
      return "";
    }
  }

  function buildRemainingRows() {
    let classCount = 0;

    for (let i = 0; i < classes.length; i++) {
      traitIndex = traits.findIndex(trait => trait.name == classes[i]);

      $("#tableContainer").append(`<div class='row' id='${classCount}'></div>`);

      $(`#${classCount}`).append(
        `<div class='cell icon-cell tooltip'><span class='tooltiptext left'>${displayTraitTooltip(
          traits[traitIndex]
        )}</span><img class='icon' src='resources/trait_icons/${
          classes[classCount]
        }.png'/><div>${
          classes[classCount]
        }</div><div class="class class-set">${displaySets(
          traitIndex
        )}</div></div>`
      );

      for (let i = 0; i < origins.length; i++) {
        $(`#${classCount}`).append(
          `<div class='cell ${classes[classCount]} ${origins[i]}'></div>`
        );
      }
      classCount++;
    }
  }

  function setChampsArray() {
    console.log("Setting champs...");
    let foundIndex = -1;

    // Removing Lux and her wonky traits
    foundIndex = champs.findIndex(x => x.champion === "Lux");
    champs.splice(foundIndex, 1);

    // If a champion has more than one class or origin, they will be split into
    // multiple instances until each instance has one class and one origin
    champs.forEach((champ, champIndex) => {
      if (champ.traits.length > 2) {
        console.log(`Duplicating ${champ.champion}`);
        champ.origins = [];
        champ.classes = [];
        champ.traits.forEach((trait, i) => {
          if (origins.findIndex(x => x == trait) != -1) {
            champ.origins.push(trait);
          } else {
            champ.classes.push(trait);
          }
        });

        champ.classes.forEach(champClass => {
          champ.origins.forEach(champOrigin => {
            let newChamp = {
              champion: champ.champion,
              cost: champ.cost,
              traits: []
            };
            newChamp.traits = [champOrigin, champClass];
            champs.push(newChamp);
          });
        });
        champs.splice(champIndex, 1);
      }
    });

    // track champions with identical origin/class
    champs.forEach((champ, i) => {
      let hits = champs.filter(
        x => x.traits[0] == champ.traits[0] && x.traits[1] == champ.traits[1]
      );
      champ.alike = hits.length;
    });
  }

  // Populates the grid with champion icons
  function populateTheGrid() {
    for (let i = 0; i < champs.length; i++) {
      let champ = champs[i];
      let target = `.${champ.traits[0]}.${champ.traits[1]}`;
      let size = `${champ.alike}`;
      let cost = `${champ.cost}`;

      $(target).append(
        `<div class="champCell cellSize-${size} cost-${cost}"><img class='champImg' src='http://ddragon.leagueoflegends.com/cdn/9.23.1/img/champion/${
          champ.champion
        }.png'/><div class="cost cost-${cost}">${cost}</div></div>`
      );
    }
  }

  function displayTraitTooltip(trait) {
    let output = "";

    // Some traits have an innate ability as well as a description.
    if (trait.innate) {
      output += trait.innate;

      if (trait.description && trait.innate) {
        output += "<br/><br/>";
      }
    }
    if (trait.description) {
      output += trait.description;
    }

    return output;
  }

  // Checks to make sure every champion has one origin and one class
  function willAllPopulate() {
    let allWillPopulate = true;
    let willNotPopulate = [];
    champs.forEach(champ => {
      let index1 = origins.findIndex(origin => origin === champ.traits[0]);
      let index2 = origins.findIndex(origin => origin === champ.traits[1]);

      if (index1 === -1 && index2 === -1) {
        willNotPopulate.push(champ.champion);
        allWillPopulate = false;
      } else if (index1 !== -1 && index2 !== -1) {
        willNotPopulate.push(champ.champion);
        allWillPopulate = false;
      }
    });

    if (!allWillPopulate) {
      console.log(
        "Bad data - the following champions will be omitted:",
        willNotPopulate
      );
    } else {
      console.log("All champions have an origin and a class. Good to go.");
    }
  }
});
