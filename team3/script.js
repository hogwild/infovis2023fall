document.addEventListener('DOMContentLoaded', function () {
    const transfersList = document.getElementById('transfers-list');
    const parentContainer = document.createElement('div');

    parentContainer.classList.add('parent-container');

    const csvPath = './top10.csv';

    fetch(csvPath)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').slice(1);
            const transfers = [];

            rows.forEach(row => {
                const [player, playerImage, from, fromClubLogo, to, toClubLogo, year, fee] = row.split(',');
                transfers.push({player, playerImage, from, fromClubLogo, to, toClubLogo, year, fee: parseFloat(fee)});
            });

            transfers.sort((a, b) => b.fee - a.fee);

            transfers.slice(0, 10).forEach((transfer, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('transfer-container');
                listItem.innerHTML = `
                    <div class="background-container" style="background-image: url('./images/card.png')">
                    <img src="./images/${transfer.playerImage}" alt="${transfer.player}" class="player-image">
                    <img src="./images/${transfer.fromClubLogo}" alt="${transfer.from} Logo" class="fromclub-logo">
                    <img src="./images/arrow.png" class="arrow">
                    <img src="./images/${transfer.toClubLogo}" alt="${transfer.to} Logo" class="toclub-logo">
                    <div class="text-container">
                        <span>€${transfer.fee} million</span>
                    </div>
                    <div class="player-name-container">
                        <span>${transfer.player}</span>
                    </div>
                    </div>
                `;
                parentContainer.appendChild(listItem);
            });
            transfersList.appendChild(parentContainer);
        })
        .catch(error => console.error('Error loading CSV:', error));
});
