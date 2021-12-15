const button = document.getElementById('submit-btn');

const submit = () => {
    const getIdAndValue = (text) => {
        const arr = text.split(" ");
        return {
            id: arr[0],
            value: arr[1]
        };
    };

    const insertObject = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        phone: document.getElementById('phone').value,
        city: getIdAndValue(document.getElementById('city').value),
        clinic: getIdAndValue(document.getElementById('clinic').value),
        specialist: getIdAndValue(document.getElementById('specialist').value),
        service: getIdAndValue(document.getElementById('service').value)
    };

    console.log(JSON.stringify(insertObject))

    fetch("http://localhost:3030/add", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(insertObject)
    }).then(response => response.status);
}

// button.addEventListener('click', submit);

