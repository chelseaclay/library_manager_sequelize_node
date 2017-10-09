module.exports = {
    getPagination: function(list, pages, amountToShow) {
        pages = [];
        let numPages = Math.ceil(list.length / amountToShow);
        for (let i = 1; i <= numPages; i += 1) {
            pages.push(i);
        }
        return pages;
    },
};

function search() {
    let searchValue = document.getElementById('search').value;
    window.location.href = '/books?search=' + searchValue;
    console.log(searchValue)
    return searchValue;
}