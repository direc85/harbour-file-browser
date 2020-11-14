// functions for handling bookmarks
// (no library because variables from the environment are needed)

.import "paths.js" as Paths

function _defaultFor(arg, val) {
    return typeof arg !== 'undefined' ? arg : val;
}

function addBookmark(path, name) {
    if (!path) return;
    name = _defaultFor(name, Paths.lastPartOfPath(path))
    settings.write("Bookmarks/"+path, name);

    var bookmarks = getBookmarks();
    bookmarks.push(path);
    settings.write("Bookmarks/Entries", JSON.stringify(bookmarks));
    main.bookmarkAdded(path);
}

function removeBookmark(path) {
    if (!path) return;
    var bookmarks = getBookmarks();
    var filteredBookmarks = bookmarks.filter(function(e) { return e !== path; });
    settings.write("Bookmarks/Entries", JSON.stringify(filteredBookmarks));
    settings.remove("Bookmarks/"+path);
    main.bookmarkRemoved(path);
}

function moveBookmark(path) {
    if (!path) return;
    var bookmarks = getBookmarks();
    var oldIndex = undefined;

    for (var i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i] === path) {
            oldIndex = i;
            break;
        }
    }

    var newIndex = oldIndex === 0 ? bookmarks.length-1 : oldIndex-1;
    bookmarks.splice(newIndex, 0, bookmarks.splice(oldIndex, 1)[0]);
    settings.write("Bookmarks/Entries", JSON.stringify(bookmarks));
    main.bookmarkMoved(path);
}

function hasBookmark(path) {
    if (!path) return false;
    if (settings.read("Bookmarks/"+path) !== "") return true;
    return false;
}

function getBookmarks() {
    try {
        var entries = JSON.parse(settings.read("Bookmarks/Entries"));
        // remove duplicates
        entries = entries.filter(function(value, index, self){ return self.indexOf(value) === index; });
        return entries;
    } catch (SyntaxError) {
        // The ordering field seems to be empty. It is possible that it was lost because
        // the user moved the settings folder while the app was running. There is no way
        // to restore it, but at least we can make sure all entries are still shown.
        var keys = settings.keys("Bookmarks").filter(function(e) { return e !== 'Entries'; });
        settings.write("Bookmarks/Entries", JSON.stringify(keys));
        return keys;
    }
}

function getBookmarkName(path) {
    if (path === "") return "";
    var name = settings.read("Bookmarks/"+path);

    if (name === "") {
        console.warn("empty bookmark name for", path, "- reset to default value");
        addBookmark(path);
    }

    return name;
}