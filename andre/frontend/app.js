const apiUrl = 'http://localhost:3000/item';

async function addNewItem() {
  const nameInput = document.getElementById('itemName');
  const valueInput = document.getElementById('itemValue');

  const itemName = nameInput.value.trim();
  const itemValue = parseInt(valueInput.value, 10);

  if (!itemName || isNaN(itemValue)) {
    alert('Por favor ingresa un nombre y un valor válidos.');
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: itemName, value: itemValue })
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error: ${errorText}`);
      return;
    }

    nameInput.value = '';
    valueInput.value = '';
    fetchAllItems();
  } catch (error) {
    console.error('Error de red:', error);
  }
}

async function fetchAllItems() {
  try {
    const response = await fetch(apiUrl);
    const itemsData = await response.json();
    const itemList = document.getElementById('itemList');
    
    itemList.innerHTML = '';

    itemsData.forEach(item => {
      const listItemElement = document.createElement('li');
      listItemElement.textContent = `${item.name} - ${item.value}`;
      itemList.appendChild(listItemElement);
    });
  } catch (error) {
    console.error('Error al cargar la lista:', error);
  }
}

document.getElementById('addItemBtn').addEventListener('click', addNewItem);
document.addEventListener('DOMContentLoaded', fetchAllItems);