(function($, window) {

    "use strict";

    window.Prism = window.Prism || {};
    Prism.manual = true;

    //define the mehods 
    var namespace = 'codeparlMarkdown',
        aceEditor = null,
        classPrefix = 'cpme-',
        snippetManager = null,
        formData = new FormData(),
        $container = null,
        $editor, $preview,
        options = null,
        converter = new showdown.Converter({
            ghCompatibleHeaderId: true,
            prefixHeaderId: 'cpmep-',
            parseImgDimensions: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tables: true,
            tablesHeaderId: true,
            tasklists: true,
            ghMentions: true,
            ghMentionsLink: "https://github.com/{u}",
            openLinksInNewWindow: true,
            emoji: true,
            metadata: true
        }),

        buttonActions = {
            btnHeader1: {
                tooltip: 'Heading 1 <h1>',
                action: 'h1'
            },
            btnHeader2: {
                tooltip: 'Heading 2 <h2>',
                action: 'h2'
            },

            btnBold: {
                tooltip: 'Strong <strong> ',
                action: 'bold'
            },
            btnItalic: {
                tooltip: 'Empasise <em>',
                action: 'italic'
            },
            btnbrowse: {
                tooltip: 'Open a markdown file',
                action: 'browse'
            },

            btnCode: {
                tooltip: 'Code Sample <pre><code>',
                action: 'code'
            },
            btnBlock: {
                tooltip: 'Blockquote <blockquote>',
                action: 'block'
            },


            btnList: {
                tooltip: 'Bulleted list <ul>',
                action: 'ul'
            },
            btnOrderedList: {
                tooltip: 'Numbered list <ol>',
                action: 'ol'
            },
            btnRule: {
                tooltip: 'Horizontal rule <hr>',
                action: 'rule'
            },
            btnLink: {
                tooltip: 'Hyperlink <a>',
                action: 'link'
            },
            btnImage: {
                tooltip: 'Insert image <img>',
                action: 'image'
            },
            btnFont: {
                tooltip: '',
                action: 'font'
            },
            btnEdit: {
                tooltip: 'Edit',
                action: 'edit'
            },
            btnPreview: {
                tooltip: 'Preview',
                action: 'preview'
            },
            btnFullscreen: {
                tooltip: 'Fullscreen',
                action: 'fullscreen'
            },
            btnHelp: {
                tooltip: 'Toggle markdown help',
                action: 'help'
            },

        }; //end buttonActions
    converter.setFlavor('github');
    var helpList = {
        links: {
            label: "Links",
            help: "To use links in your markdown text you just have to  use <span> http://codeparl.com - automatic! <br> [a link](https://www.codeparl.com/) <br> Format: [text](url)</span>"
        },
        images: {
            label: "Images",
            help: "Images are exactly like links, but they have an exclamation mark before  them:<br>" +
                "<span> ![CodeParl logo](https://codeparl.com/storage/images/logo.png) <br> Format: ![Alt Text](url)</span>" +
                "The word in square brackets is the alt text, which gets displayed if the browser can't show the image. "
        },
        styling: {
            label: "Styling/Heading",
            help: "<span> *This is italicized*, and so <br> is _this_. <br> **This is bold**, just like __this__." +
                "<br>You can ***combine*** them if you ___really have to___.</span>" +
                "To break your text into sections, you can use headers: <span>" +
                "A Large Header<br>============== <br><br>Smaller Subheader<br>-----------------" +
                "</span>Use hash marks if you need several levels of headers: <span>" +
                "# Header 1 #<br> ## Header 2 ##<br>### Header 3 ###</span> Use dashes if you need a " +
                "horizontal rule <span>----------</span>"
        },
        lists: {
            label: "Lists",
            help: "Both bulleted and numbered lists are possible:<span>- Use a minus sign for a bullet<br>" +
                "+ Or plus sign<br>* Or an asterisk<br><br>1. Numbered lists are easy<br>2. Markdown keeps track of" +
                "the numbers for you<br>7. So this will be item 3.<hr>1. Lists in a list item:" +
                "<br> - Indented four spaces.<br> * indented eight spaces.<br>- Four spaces again.<br>" +
                "2.  You can have multiple<br>  paragraphs in a list items. <br>Just be sure to indent."
        }
    };

    var commands = {
        bold: {
            name: 'bold',
            bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
            exec: function() {
                var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange());
                if (selectedText.trim().length === 0) {
                    snippetManager.insertSnippet(aceEditor, '**${1:text}**');
                    aceEditor.find('text');
                } else {
                    snippetManager.insertSnippet(aceEditor, '**' + selectedText + '**');
                }
                aceEditor.focus();
            },
            readOnly: false
        },

        italic: {
            name: 'italic',
            bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
            exec: function() {
                var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange());
                if (selectedText === '') {
                    snippetManager.insertSnippet(aceEditor, '*${1:text}*');
                    aceEditor.find('text');
                } else {
                    snippetManager.insertSnippet(aceEditor, '*' + selectedText + '*');

                }

                aceEditor.focus();
            },
            readOnly: false
        },
        link: {
            name: 'link',
            bindKey: { win: 'Ctrl-K', mac: 'Command-K' },
            exec: function() {
                var $modal = urlModal({ title: 'Enter Url', body: urlInputs() })
                    .modal('show');
                getEntredUrl($modal, true);
            },
            readOnly: false
        }
    }; //end commands 




    function getEntredUrl() {
        var text = '',
            $modal = $('.cpme-modal.link-modal'),
            url = '';
        var $inputs = $modal.find('input[type=text] , input[type=url]');
        var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange()) || '';
        $inputs.eq(0).val(selectedText);

        $modal.find('.cpme-select-url').on('click.' + namespace, function() {
            text = $inputs.eq(0).val();
            url = $inputs.eq(1).val();
            if (url.length > 0 && text.length > 0) {
                if (url.search(/https?/) == -1)
                    url = 'http://' + url;
                snippetManager.insertSnippet(aceEditor, '[' + text + '](' + url + ')');
                $('button[data-action="link"]').trigger('click.' + namespace);
            }
        }).next('button').on('click.' + namespace, function() {
            $('button[data-action="link"]').trigger('click.' + namespace);
        });


    }

    function insertText(code, holder) {
        var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange()) || '';
        selectedText.trim();
        var range = aceEditor.find(holder, {
            wrap: true,
            caseSensitive: true,
            wholeWord: true,
            regExp: false,
            preventScroll: true // do not change selection
        });

        if (holder === 'rule') {
            aceEditor.insert(code);
            aceEditor.navigateLineEnd();
            return;
        }

        if (range !== null) {
            aceEditor.session.replace(range, holder);
        } else {
            if (aceEditor.getCursorPosition().column === 0) {

                if (code === '``')
                    aceEditor.insert('`' + holder + '`');
                else
                    aceEditor.insert(code + holder + '');

            } else {
                if (selectedText.length > 0) {
                    range = aceEditor.getSelectionRange();
                    //obtain selection range
                    if (code === '``') {
                        aceEditor.insert('`' + selectedText + '`');
                        aceEditor.session.replace(range, '`' + selectedText + '`');
                    } else {
                        aceEditor.session.replace(range, code + selectedText);
                    } //if-code

                } else {
                    aceEditor.navigateLineStart();
                    if (code === '``')
                        aceEditor.insert('`' + holder + '`');
                    else
                        aceEditor.insert(code + holder + ' ');
                    aceEditor.navigateLineEnd();
                } //if-text
            } //if-column
        }
        if (selectedText.trim().length === 0)
            aceEditor.find(holder);
        aceEditor.focus();
    }


    function addImage(url, name) {
        snippetManager.insertSnippet(aceEditor, '![' + name + '](' + url + ')');
        $('button[data-action="image"]').trigger('click.' + namespace);

    }

    function browseImage() {
        $('.cpme-browse-img :input').on('change.' + namespace, function() {
            var thisInput = $(this);
            if (thisInput[0].files && thisInput[0].files[0])
                readImage(thisInput[0].files[0]);
        });


    }



    function selectImage(callback) {
        $('button.cpme-select-img').on('click.' + namespace, function() {
            if (options.content.image.backendScript.trim().length === 0)
                return;

            $(this).css('width', '86.4333px')
                .html($('<i>').addClass('fas fa-spinner fa-spin'));

            $.ajax({
                url: options.content.image.backendScript,
                type: 'post',
                processData: false,
                dataType: "json",
                cache: false,
                async: false,
                contentType: false,
                data: formData
            }).done(function(response) {
                if (response.imageUrl) {
                    callback(response.imageUrl, response.name);

                } else {
                    //console.log(response)
                }


            }).fail(function(response) {
                //console.log(response);
            });

        });



    }

    function readImage(file) {
        var fileReader = new FileReader();
        fileReader.onload = function(evt) {
            $('.cpme-drag-drop img').attr('src', evt.target.result);

        };
        fileReader.readAsDataURL(file);
        formData.append('image', file);
        selectImage(addImage);
        $('button.cpme-select-img').prop('disabled', false);
    }

    function dragOver() {
        $('.cpme-drag-drop').on('dragenter.' + namespace + ', dragover.' + namespace, function(e) {
            e.stopPropagation();
            e.preventDefault();
        }).on('drop.' + namespace, function(e) {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            if (files && files[0])
                readImage(files[0]);
        });
    }


    function addFontList() {
        var $select = $('<select>')
            .addClass('custom-select cpme-font-size py-1 ')
            .on('change.' + namespace, function() {
                aceEditor.
                setOption('fontSize', options.editor.fontSizes[$(this).val()]);
            });

        for (const key in options.editor.fontSizes) {
            var $option = $('<option>').text(key).appendTo($select);
            if (key === options.editor.defaultFont)
                $option.attr('selected', 'selected');
        }
        return $select;

    }


    function modal() {
        var $hbar = $('.cpme-help-bar');
        var $panel = $('<div>')
            .addClass(classPrefix + 'modal   w-100 position-absolute ');
        $panel.insertBefore($hbar).css({
            top: $hbar.height()
        });
        var $content = $('<div>')
            .addClass(classPrefix + 'modal-content d-flex flex-column mx-auto my-3   ');
        $content.appendTo($panel);
        return { pane: $panel, content: $content };
    }


    function addLink() {
        var $panel = modal().pane.addClass('link-modal'),
            $content = modal().content;

        $content.addClass('w-50 mx-auto');
        $("<label>").text('Text')
            .append($('<input>')
                .attr({ type: 'text', placeholder: 'Enter url text here...' })
                .addClass('form-control'))
            .appendTo($content);

        $("<label>").text('URL')
            .append($('<input>')
                .attr({ type: 'url', placeholder: 'e.g. http://example.com' })
                .addClass('form-control'))
            .appendTo($content);

        $("<div>").addClass('text-center my-3')
            .append($("<button>").prop('disabled', false)
                .addClass('btn cpme-select-url btn-lg mr-2 btn-success  ')
                .text('Add'))
            .append($("<button>").addClass('btn btn-lg btn-danger ')
                .text('Cancel'))
            .appendTo($content);

        getEntredUrl();
        return $panel;
    }

    function imagePanel() {
        var $panel = modal().pane.addClass('image-modal'),
            $content = modal().content;

        var imageTypes = options.content.image.types;
        var h = options.editor.editorHeight - (70 + 60);
        var css = { height: h + 'px', "background-image": "url(" + options.content.image.placeholder + ")" };
        $('<div>').addClass('d-flex border p-2 bg-light shadow')
            .html($('<label>').text('Browse an image...')
                .append(
                    $('<input>').attr({ type: 'file', accept: imageTypes }).hide())
                .addClass('cpme-zoom-hover bg-success cpme-browse-img  d-block text-white '))
            .appendTo($content);


        $('<div>').addClass('cpme-drag-drop position-relative shadow-lg w-100 border mt-3 mb-2 mx-auto')
            .css(css).append($('<img>')
                .attr({ alt: '', src: '' })
                .addClass(' mx-auto d-block p-0 img-fluid '))
            .appendTo($content).append(
                $('<p>').addClass('position-absolute h2')
                .text('Drag and drop an image here')
            );

        $("<div>").addClass('text-center my-3')
            .append($("<button>").prop('disabled', true)
                .addClass('btn cpme-select-img btn-lg mr-2 btn-success  ')
                .text('Select'))
            .append($("<button>").addClass('btn btn-lg btn-danger ')
                .text('Cancel'))
            .appendTo($content);

        $('button.cpme-select-img').next('button').on('click.' + namespace, function() {
            $('button[data-action="image"]').trigger('click.' + namespace);
        });
        dragOver();
        return $panel;
    }


    function addGroup($toolbar) {
        return $('<div>')
            .addClass('btn-group cpme-btn-group   mr-1')
            .appendTo($toolbar);
    }

    function view(edit, $thisBtn) {
        if (edit) {
            $editor.show();
            $preview.hide();
            $('.cpme-btn-normal')
                .prop('disabled', false)
                .removeClass('disabled');
        } else {
            $editor.hide();
            $preview.show();
            var markdown = aceEditor.session.getValue();
            var html = converter.makeHtml(markdown);
            options.onPreview(disableJs(html), markdown);
            $preview.html(disableJs(html));
            Prism.highlightAllUnder($preview[0]);
            $('.cpme-btn-normal')
                .prop('disabled', true)
                .addClass('disabled');
        }
        $thisBtn.addClass('active');
        $thisBtn.siblings('button').removeClass('active');
    }

    function browseMarkdown($input) {
        $input.on('change.' + namespace, function() {
            options.onFileBrowse($input, aceEditor);
        });


    }

    function disableJs(html) {
        if (!options.allowScript) {
            return html.replace("<script>", '&lt;script&gt;');
        }

    }

    function triggerEditorActions() {
        $container.find('.cpme-toolbar .cpme-btn').each(function() {
            $(this).on('click.' + namespace, function(e) {
                e.preventDefault();
                var $thisBtn = $(this);
                var action = $thisBtn.data('action');

                //hide all tooltips
                $('[data-original-title]').tooltip('hide');

                switch (action) {
                    case 'help':
                        $('.cpme-help-bar').slideToggle('fast');
                        break;
                    case 'preview':
                        view(false, $thisBtn);
                        break;
                    case 'edit':
                        view(true, $thisBtn);
                        break;
                    case 'browse':
                        var $input = $thisBtn.next('.cpme-file-browser');
                        browseMarkdown($input);
                        $input.trigger('click.' + namespace);
                        break;
                    case 'fullscreen':
                        $('body').toggleClass('cpme-fullscreen');
                        $container.toggleClass('fullscreen');
                        $thisBtn.find('i').toggleClass('fa-expand fa-compress');

                        if ($thisBtn.find('i').hasClass('fa-expand'))
                            $thisBtn.attr('data-original-title', 'Fullscreen');
                        else
                            $thisBtn.attr('data-original-title', 'Restore');
                        break;
                    case 'h1':
                        insertText('# ', 'type your heading here');
                        break;
                    case 'h2':
                        insertText('## ', 'type your heading here');
                        break;
                    case 'ul':
                        insertText('* ', 'type your item here');
                        break;
                    case 'ol':
                        insertText('1. ', 'type your item here');
                        break;
                    case 'rule':
                        insertText('----------', 'rule');
                        break;
                    case 'block':
                        insertText('> ', 'type here');
                        break;
                    case 'code':
                        insertText('``', 'enter code here');
                        break;
                    case 'bold':
                        aceEditor.execCommand('bold');
                        break;
                    case 'italic':
                        aceEditor.execCommand('italic');
                        break;
                    case 'link':
                        addLink().slideDown('fast');
                        $thisBtn.toggleClass('bg-white').parent('div').toggleClass('bg-white');
                        if (!$thisBtn.hasClass('bg-white'))
                            $('.cpme-modal').hide(function() {
                                $(this).remove();
                            });

                        break;
                    case 'image':
                        imagePanel().slideDown('fast');
                        $thisBtn.toggleClass('bg-white').parent('div').toggleClass('bg-white');
                        if (!$thisBtn.hasClass('bg-white'))
                            $('.cpme-modal').hide(function() {
                                $(this).remove();
                            });
                        browseImage();
                        break;

                    default:


                }
            })


        });


    }

    function toolbar() {
        var $toolbar = $('<div>')
            .addClass('cpme-toolbar border-bottom p-1 ').css({
                backgroundColor: options.toolbar.bg
            });

        for (const index in options.toolbar.buttonGroups) {
            var group = options.toolbar.buttonGroups[index];
            var $btnGroup = addGroup($toolbar);
            for (const k in group) {
                if (buttonActions.hasOwnProperty(k)) {
                    var $button = $('<button>')
                        .addClass('btn btn-sm  cpme-btn')
                        .attr({ "data-action": buttonActions[k].action, type: 'button' })
                        .attr('title', buttonActions[k].tooltip);

                    if (group[k].match(/^(fa\-.+?)$/) === null)
                        $button.text(group[k]);
                    else {

                        if (options.fullscreen === false && k === 'btnFullscreen')
                            continue;

                        $button.html($('<i>').addClass('fa ' + group[k]));

                    }


                    $btnGroup.append($button);

                    if (k === 'btnHelp') {
                        if (options.help.show)
                            $btnGroup.addClass(classPrefix + 'md-help   ');
                        else $btnGroup.remove();

                    }

                    if (k === 'btnRule') {
                        $button.html($('<span>').addClass('cpme-rule'));
                        $button.addClass('cpme-rule-btn')
                    }

                    if (k === 'btnFont') {
                        $btnGroup.html(addFontList());
                    }


                    if (k === 'btnEdit') {
                        $button.addClass('active');
                    }

                    if ($.inArray(k, ['btnEdit', 'btnPreview', 'btnHelp']) !== -1) {
                        if (k !== 'btnHelp')
                            $button.append($('<span>').text(buttonActions[k].tooltip))
                    } else {
                        $button.addClass('cpme-btn-normal');
                    }
                    if (k === 'btnFullscreen') $button.removeClass('cpme-btn-normal');

                    if (k === 'btnbrowse') {

                        $("<input>").attr({
                                type: 'file',
                                accept: ".md, .markdown",
                            }).addClass('cpme-file-browser ')
                            .hide().insertAfter($button);

                    }

                    if (typeof $().tooltip === 'function')
                        $button.tooltip();
                } //end if
            } //end for
        } //end for

        $toolbar.find('.cpme-btn-group:lt(5)')
            .wrapAll('<div class="cpme-wrapper-1  animated d-inline-block ">');

        $('<button>').addClass('btn cpme-more py-0 my-0').append($('<i>').addClass('fa fa-bars '))
            .insertAfter($($toolbar.find('.cpme-wrapper-1')));

        $toolbar.find('.cpme-btn-group:gt(6)')
            .wrapAll('<div class="cpme-wrapper-2  float-right ">');

        $toolbar.find('.cpme-more').on('click.' + namespace, function() {
            if ($(this).hasClass('bg-on'))
                $('.cpme-wrapper-1')
                .removeClass('slideInRight')
                .addClass('slideOutRight');
            else
                $('.cpme-wrapper-1')
                .removeClass('slideOutRight')
                .addClass('slideInRight');

            $(this).toggleClass('bg-on');

        });

        return $toolbar;
    }


    function helpBar() {

        var $hbar = $('<div>');
        $hbar.addClass(classPrefix + 'help-bar  w-100   mx-auto py-0 ');

        for (var k in helpList) {
            $('<button>').attr({ type: 'button', "data-key": k })
                .addClass('btn btn-sm btn-default cpme-help-btn shadow-none ')
                .text(helpList[k].label)
                .appendTo($hbar).on('click.' + namespace, function() {
                    $(this).siblings('.cpme-help-btn').removeClass('cpmd-yellow');

                    var $info = $('.' + classPrefix + 'help-bar-info');
                    $info.css({
                        top: $hbar.height(),
                        height: options.editor.editorHeight + 'px'
                    });
                    $info.html($('<p>').addClass('p-4 mx-auto ')
                        .html(helpList[$(this).data('key')].help));

                    $info.attr('data-key', $(this).data('key'));

                    if ($info.is(':hidden')) {
                        $info.slideDown('fast');
                    }

                    if ($(this).hasClass('cpmd-yellow'))
                        $info.slideUp('fast');

                    $(this).toggleClass('cpmd-yellow');
                });

        }
        $('<div>')
            .addClass(classPrefix + 'help-bar-info  w-100   mx-auto py-0 ')
            .appendTo($hbar).hide();

        $('<a>').attr({
                href: options.help.link.url,
                target: "_blank"
            }).text(options.help.link.text)
            .addClass('btn btn-link cpme-help-link float-right')
            .appendTo($hbar);

        return $hbar;
    }



    function buildAceEditor() {
        aceEditor = ace.edit($editor.get(0));
        aceEditor.setTheme('ace/theme/' + options.editor.theme);
        aceEditor.getSession().setMode('ace/mode/markdown');
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.getSession().setUseSoftTabs(options.editor.softTabs);
        aceEditor.setOptions({
            showGutter: options.editor.showGutter
        });

        aceEditor.setOption('fontSize', options.editor.fontSizes[options.editor.defaultFont]);

        ace.config.loadModule('ace/ext/language_tools', function() {
            snippetManager = ace.require('ace/snippets').snippetManager;
            aceEditor.commands.addCommand(commands.bold);
            aceEditor.commands.addCommand(commands.italic);
            aceEditor.commands.addCommand(commands.link);
        });
    }

    var methods = {
        init: function(option) {

            //first merge the options  
            options = $.extend(true, {}, $.fn.codeparlMarkdown.defaults, option);
            $editor = this;
            $editor.addClass('w-100');
            //store the settings of the element
            var isInitialized = this.filter(function() {
                return $(this).data(namespace)
            }).length > 0;


            if (isInitialized) {
                $.error('The plugin has already been initialized.');
            }

            this.data(namespace, options);

            this.css({
                height: options.editor.editorHeight + 'px'
            }).addClass('cpme-editor');
            //now we can define the logic of the plugin

            $container = this.parent();
            $container.addClass('w-100 border cpmd-container position-relative ').css({
                backgroundColor: "#F7F7F4"
            });

            var $toolbar = toolbar(options);

            $toolbar.prependTo($container);
            $toolbar.append($('<div>').addClass('clearfix'));

            //hide/show the help-bar
            if (options.help.show) {
                helpBar().insertAfter($toolbar);

            }


            //add the preview panel 
            $preview = $('<div>').addClass('cpme-preview w-100 markdown-body overflow-auto p-2 bg-white border').hide()
                .appendTo($container).css({
                    height: options.editor.editorHeight + 'px'
                });

            //initialize the ace editor for our markdown 
            buildAceEditor(options);
            triggerEditorActions(options);

            return this;
        },

        markdownContent: function(markdown) {
            if (!markdown) {
                return aceEditor.getValue();
            } else {
                aceEditor.session.setValue(markdown);
                aceEditor.clearSelection();
            }


        },

        htmlContent: function() {
            var html = converter.makeHtml(aceEditor.session.getValue());
            return html;
        },
        preview: function(markdown, options) {
            if (markdown) {
                options = $.extend(true, {}, $.fn.codeparlMarkdown.defaults, options);
                //add the preview panel 
                $container = this.parent();
                $preview = $('<div>').addClass('cpme-preview markdown-body overflow-auto p-2 bg-white border')
                    .appendTo($container).css({
                        height: options.editorHeight + 'px',
                        width: options.editorWidth
                    });
                if (markdown.trim().length > 0) {
                    var html = converter.makeHtml(markdown || '');
                    this.html($preview.html(disableJs(html)));
                    Prism.highlightAllUnder($preview[0]);
                }
            }

        },
        destroy: function() {}
    };

    //bind our plugin with jquery

    $.fn.codeparlMarkdown = function(options) {

        //the developer passed a method name
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));

        }
        //the developer passed an object for options 
        else if ($.type(options) === 'object' || !options) {

            return methods.init.apply(this, arguments);

        }
        //the developer passed a wrong method name
        else {
            $.error("The method " + options + " does not exist on " + namespace);
        }
    }


    //bind our default options to jquery 
    $.fn.codeparlMarkdown.defaults = {
        fullscreen: true,

        content: {
            allowScript: false,
            image: {
                types: '.jpeg,.jpg,.png,.gif',
                placeholder: "../src/photo-placeholder.jpg",
                backendScript: ""

            }
        },
        help: {
            show: true,
            link: {
                url: "https://www.markdownguide.org/basic-syntax/",
                text: "Advanced help"
            }
        },
        editor: {
            softTabs: true,
            theme: 'tomorrow',
            editorHeight: 500,
            fontSizes: {
                Small: 12,
                Normal: 16,
                Large: 18,
                Xlarge: 26
            },
            defaultFont: 'Normal',
            showGutter: false
        },
        toolbar: {
            bg: '#F7F7F4',
            buttonGroups: [{
                    btnHeader1: 'H1',
                    btnHeader2: 'H2',
                },
                {
                    btnBold: 'fa-bold',
                    btnItalic: 'fa-italic',
                },
                {
                    btnList: 'fa-list-ul',
                    btnOrderedList: 'fa-list-ol',
                    btnRule: 'line',
                },
                {
                    btnBlock: 'fa-quote-left',
                    btnCode: '{ }',

                },
                {
                    btnLink: 'fa-link'

                },
                {
                    btnImage: 'fa-image'
                },
                {
                    btnFont: 'font-size'
                },


                {
                    btnEdit: 'fa-edit',
                    btnbrowse: 'fa-folder-open',
                    btnPreview: 'fa-eye',
                    btnFullscreen: 'fa-expand',
                },
                {
                    btnHelp: 'fa-question-circle',

                }

            ],
        },
        onFileBrowse: function($input, aceEditor) {
            // you can access the file object 
            //of this input here. you may also validate the file type 
            // with your backend script
            if ($input[0].files[0]) {
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    aceEditor.session.setValue(e.target.result);
                    aceEditor.clearSelection();
                }

                fileReader.readAsText($input[0].files[0]);
            }
        },
        onPreview: function(html, markdown) {

            //do something with this html    
        }

    };


})(jQuery, window);