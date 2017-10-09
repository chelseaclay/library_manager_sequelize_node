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
