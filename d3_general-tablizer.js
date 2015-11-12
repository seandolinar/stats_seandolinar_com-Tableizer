
//version 1.0  -- fixes, rowbanding, new interface release

//sets global variables
var delimiter = ','
var tableWidth = 600
var title = 'title'
var font = 'Lato, Arial'
var userColorBkgdTitle = '#0066CC'
var userColorFontTitle = ''
var userColorBkgdCol = ''
var userColorFontCol = ''
var sortable = 0
var rows = null
var columns = null
var numColumns = 1
var numRows = 0
var key = ''
var value = ''
var site = 'FG'  

/////////////////////
//utility functions//
/////////////////////

//Build repeat function for other browsers
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  }
}


function getColorVal(colorValue){

    value = colorValue
}


var setHeaderRow = function() {

  userColorBkgdCol = $('[name="sd-head-bkgd-color"]').val()
  userColorFontCol = $('[name="sd-head-font-color"]').val()

  d3.selectAll('#sd-header-swatch')
  .style('background-color', userColorBkgdCol)
  .style('color', userColorFontCol)
  .attr('value','["' + userColorBkgdCol + '", "' + userColorFontCol + '"]')

  

}

var instructVis = function() {

  $('div#sd-instruct').css('display','block')

}



$('.sd-page').on('click', function(e) { 
    

    d3.selectAll('div#sd-instruct').style('display','none')
    

    // $('div#sd-instruct')

    
  })

 $('input#link').click(function(event){
     event.stopPropagation();
 });

//returns the delimiter for the parser in buildDataArray
var selectParser = function(parser, stringData) {
    if (parser == 'auto') {
    return testParser(stringData)
  }
  else if (parser == 'CSV') {
    return ','
  }
  else if (parser == 'TSV') {
    return '\t'
  }
}


//determines what delimiter the parser should use
var testParser = function(string) {

  countTab = (string.match(/\t/g) || []).length
  countComma = (string.match(/,/g) || []).length

  if (countTab/(countTab + countComma) > .75) {
    return '\t'
  }
  else if (countComma/(countTab + countComma) > .75) {
    return ','
  }
  else {
    alert('The parser cannot automatically determine the format. It will default to CSV. Please specify Excel/TSV if that is the desired format.')
  }
}

//returns an array of an array
//rebuild this for colspan
var buildDataArray = function(data,delimiter) {

    arrayOut = []
    
    $.each(data, function(itemNo, item) {

            var dataRow = item.split(delimiter)
            numColumns = Math.max(numColumns, dataRow.length)

            if ( !$('input[name="check-empty-rows"]').is(':checked') || (dataRow.length > 1) || !(dataRow[0].length == 0) ) {
              arrayOut.push(dataRow)
            }
            
    })
    
    return arrayOut
}



//////////////////
//main functions//
//////////////////


//resets the table
var clearTable = function() {

    d3.selectAll('table').remove()
    d3.selectAll('.table-title').remove()
    d3.selectAll('.source').remove()
    d3.selectAll('.table-container').remove()


}

var equalArray = function() {

  for (i = 0; i <= numColumns; i++) {

    var maxLength = 0

    d3.selectAll('td[column="'+i+'"]').filter('.d3-td').each(function() {

      var tdText = d3.select(this).text()
      if (/\d/.test(tdText)) {
        maxLength = Math.max(tdText.length, maxLength)
      }
      
    })

    d3.selectAll('td[column="'+i+'"]').filter('.d3-td').each(function() {

      addSpace = maxLength - d3.select(this).text().length
      if (addSpace > 0 ) {

        blankSpace = '&#x2007;'
        d3.select(this).html(blankSpace.repeat(addSpace) + d3.select(this).text())
      }
      
    })

  }

}


var buildTable = function(dataTable) {

          title = $('#title').val()
          source = $('#source').val()
          firstColumn = $('input[name="left-justified"]').is(':checked')

          userColorBkgdTitle = $('[name="sd-title-bkgd-color"]').val()
          userColorFontTitle = $('[name="sd-title-font-color"]').val()
          userColorBkgdCol = $('[name="sd-head-bkgd-color"]').val()
          userColorFontCol = $('[name="sd-head-font-color"]').val()
          userColorBkgdRow = $('[name="sd-row-bkgd-color"]').val()
          userColorFontRow = $('[name="sd-row-font-color"]').val()
          userColorBandRow = $('[name="sd-row-band-color"]').val()
          userColorHighlightRow = $('[name="sd-highlight-color"]').val()  
          userColorHighlightFont = $('[name="sd-highlight-font-color]').val()


          userTableFont = $('[name="sd-table-font"]').val()


                    formatDict = {'FG': {'font-family':  'Lato, Arial', 'background-color': '#52ae26', 'img': 'http://www.fangraphs.com/blogs/wp-content/uploads/2015/08/FG_logo_transparency.png',
                                'highlight': '#FDC60D', 'title-font-size': '18px', 'line-height': '1', 'source-font-size': '10px', 'source-min-height': '12px', 'title-min-height': '22px','margin-bottom': ''}, 
                        'THT': {'font-family':  '', 'background-color': '#8e001c', 'img': 'http://www.hardballtimes.com/wp-content/uploads/2015/08/THT_logo_transparency.png',
                                'highlight': '#d3ceaa', 'title-font-size': '', 'line-height': '', 'source-font-size': '12px', 'source-min-height': '22px', 'title-min-height': '42px', 'margin-bottom': '26px'},
                        'RG': {'font-family':  'Lato, Arial', 'background-color': '#825a3f', 'img': 'http://www.fangraphs.com/blogs/wp-content/uploads/2015/08/FG_logo_transparency.png',
                                'highlight': '#FDC60D', 'title-font-size': '18px', 'line-height': '1', 'source-font-size': '10px', 'source-min-height': '12px', 'title-min-height': '22px', 'margin-bottom': ''},
                        'COM': {'font-family':  'Lato, Arial', 'background-color': '#336699', 'img': 'http://www.fangraphs.com/blogs/wp-content/uploads/2015/08/FG_logo_transparency.png',
                                'highlight': '#FDC60D', 'title-font-size': '18px', 'line-height': '1','source-font-size': '10px', 'source-min-height': '12px', 'title-min-height': '22px', 'margin-bottom': ''}
                      }

          //selects options based on site variable
          formatTable = formatDict[site]

          //clears any existing table
          clearTable()

          //BUILDS OUTTER CONTAINER
          d3.select('#sd-tableizer-container')
            .style('max-width',tableWidth + 'px')
            .attr('site', site)
            .append('div')
            .attr('class', 'table-container')
            .style('max-width',tableWidth + 'px')
            .style('background-color', 'white')
            .style('margin-bottom', formatTable['margin-bottom'])



          tableTitle = d3.select('.table-container')
            .append('div').attr('class', 'table-title').html(title)
              .attr('id', 'title-' + site)
              .style('min-height', '12px')
              .style('text-align','center')
              .style('vertical-align', 'middle')
              .style('padding','7px 50px')
              .style('font-family', userTableFont)
              .style('color', userColorFontTitle)
              .style('background-color', userColorBkgdTitle)
              .style('font-size', formatTable['title-font-size'])
              .style('word-wrap', 'break-word')
              .style('line-height', formatTable['line-height'])    
        

          //SORTABLE
          sortableCheck = $('input[name="sortable"]').is(':checked')

          //BUILDS TABLE
          table = d3.select('.table-container').append('table')
              .attr('class', function() {
                if (sortableCheck){
                  return 'sortable'
                }
              })
              .attr('border','1')
              .style('font-family', userTableFont)
              .style('max-width', tableWidth + 'px')
              .style('width', '100%')
              .style('border','1px solid black')
              .style('border-collapse', 'collapse')
              .style('text-align', 'center')
              .style('margin-bottom', '0px')
              .style('background-color', userColorBkgdRow)
              .style('color', userColorFontRow)

          
          //BUILDS HEADER
          tableHeader = table.append('tr').attr('class', 'table-header')
          .style('cursor', function() {
            if (sortableCheck){
              return 'pointer'
            }
            
          })
          .style('text-align','center')
          .style('background-color', userColorBkgdCol)
          .style('color', userColorFontCol)


          //BUILDS HEADER CELLS
          equalWidth = $('input[name="equalwidth"]').is(':checked')

          tableHeader.selectAll('td').data(headerArray).enter().append('td')       
            .text(function(d) { return d; })
            .attr('class','d3-th')
            .attr('column', function(d,i) {return i;})
            .attr('width', function() {
              if (equalWidth) {
                return tableWidth/headerArray.length + 'px'
              }
              
            })

          //BUILDS ROWS 
          numRows = dataTable.length + 1 
          rowBanding = $('input[name="rowbanding"]').is(':checked') && (numRows > 5) && !sortableCheck

          tableTr = table.selectAll('.table-rows').data(dataTable).enter().append('tr')
          .attr('class','table-rows')

          .attr('id', function(d,i) {return 'row-' + i;})      
          .attr('bgcolor',function(d,i){
              if (i % 2 == 1 && rowBanding){
                return userColorBandRow
              }
            })
          .style('border', '1px solid black')

          if ($('input[name="check-highlight-rows"]').is(':checked')) {

            tableTR = tableTr.attr('onMouseOver', "this.bgColor='"+ userColorHighlightRow + "'; this.style.color='" + userColorHighlightFont + "'")
            .attr('onmouseout', function(d,i){
                if (i % 2 == 1 && rowBanding){
                  return "this.bgColor='"+ userColorBandRow +  "'; this.style.color='" + userColorFontRow + "'"
                }
                else
                {
                  return "this.bgColor='" + userColorBkgdRow +  "'; this.style.color='" + userColorFontRow + "'"
                }
              })
          }


          //ADDS NUMBERED ROWS
          if ($('input[name="check-numbered-rows"]').is(':checked')) {
            tableHeader.insert("th", ":first-child").html('')
            tableTr.append('td').html(function(d,i) {return i+1;}).attr('width','60px')
          }

          //////////////////
          //ADDS MAIN DATA//
          /////////////////
          tableTd = tableTr.selectAll('.td').data(function(d) { return d;} )
            .enter()
            .append('td').html(function(d) { return d;} )
            .attr('column', function(d,i) {return i;})
            .attr('class', 'd3-td')
            .filter('[column="0"]')
            .style('padding-left', function(d, i) {
              if (i == 0) {
                return '5px'
              }
              else {
                return '0px'
              }
            })
            .style('text-align', function(d, i) {
              if (i == 0 && firstColumn) {
                return 'left'
              }
              else {
                return 'center'
              }
            })

          //////////
          //SOURCE//
          /////////
          if (source.length > 0) {
            sourceOut = 'SOURCE: ' + source
          }
          else {
            sourceOut = ''
          }

          if ( ($('input[name="source-bar"]').is(':checked') && numRows < 10) || (numRows >= 10 && $('input[name="source-bar-10"]').is(':checked')) || source.length > 0 || $('#text-area-notes').val().length > 0) {

            d3.select('.table-container').append('div').attr('class', 'source').text(sourceOut)
              
              .style('min-height', formatTable['source-min-height'])
              .style('text-align','right')
              .style('padding','3px 10px')
              .style('font-family', userTableFont)
              .style('color', userColorFontTitle)
              .style('background-color',userColorBkgdTitle)
              .style('font-size', formatTable['source-font-size'])
              .style('border', '1px solid black')
            }

          /////////
          //NOTES//
          /////////
          notes = $('#text-area-notes').val()
          notes =  notes.split('\n').join('<br>')

          if (notes.length > 0) {

            d3.select('.table-container').append('div').attr('class', 'notes').html(notes)
            
            .style('padding','3px 10px')
            .style('font-size', '12px')              
            .style('font-family', userTableFont)
            .style('border-left', '1px solid black')
            .style('border-right', '1px solid black')
            .style('border-bottom', '1px solid black')
          }


          if ($('input[name="tht-justified"]').is(':checked')) {
            equalArray()
          }

          ////////////////
          //HTML! BUTTON//
          ////////////////
          $('#html-out').on('click',function(){

            if ($('input[name="sortable"]').is(':checked')) {

                textHTML =  $('#sd-tableizer-container').html()

            }
            else {
              textHTML = $('#sd-tableizer-container').html()
            }
            $('#Text2').val(textHTML)
          })
  



    }


interactionBuild = function() {

          setHeaderRow()


          var formatObj = {'backgroundcolor':'background-color','fontweight':'font-weight', 'fontcolor': 'color', 
          'text-decoration': 'text-decoration', 'text-align': 'text-align', 'colspan': 'colspan', 'remove': 'remove',
          'header-row': ['background-color','color']}


          //COLUMN | HEADER ACTION
          d3.selectAll('.d3-th').on('dragenter', function() {

            d3.select(this).style('border', '2px solid red').attr('highlight','true')      
            var columnId =  d3.select(this).attr('column')
            newRows = d3.selectAll('[column="'+ columnId + '"]').filter('.d3-td')
            setTimeout(function() {rows = newRows}, 30)

          }).on('dragleave', function(){
              d3.select(this).style('border', '1px solid black').attr('highlight','false')
            })

          //ROW ACTION
          d3.selectAll('.table-rows').on('dragenter', function() {

            newRows = d3.select(this)
            d3.select(this).style('border', '3px solid red').attr('highlight','true')
            setTimeout(function() {rows = newRows}, 30)

          }).on('dragleave', function(){
              d3.select(this).style('border', '1px solid black').attr('highlight','false')
            })

          //LEAVE TABLE ACTION
          d3.selectAll('#sd-tableizer-container').on('dragenter', function() {
            rows = null
          })

          //COLOR SWATCH ACTION
          d3.selectAll('.sd-color-swatch').on('dragend', function() {
              console.log('dragend')
              console.log(rows)
              key = formatObj[d3.select(this).attr('key')]
              value = d3.select(this).attr('value')
              // value = $(this).val()
              console.log(key)
              rows.style(key, value)
              d3.selectAll('[highlight="true"]').style('border', '1px solid black').attr('highlight','false')
 
            })

          d3.selectAll('.sd-color-picker').on('dragend', function() {
              console.log('dragend')
              console.log(rows)
              key = formatObj[d3.select(this).attr('key')]
              // value = d3.select(this).attr('value')
              value = $(this).val()
              console.log(value)
              rows.style(key, value)
              d3.selectAll('[highlight="true"]').style('border', '1px solid black').attr('highlight','false')
 
            })

          //TABLE SWATCH ACTION
          d3.selectAll('.sd-table-swatch').on('dragend', function() {

                rows.attr('id')
                if ($('input[name="check-numbered-rows"]').is(':checked')) {
                  numColumns = numColumns + 1
                }

                d3.select('table').insert('tr', 'tr#' + rows.attr('id'))
                .attr('class', 'table-rows')
                .attr('id', 'row-added')
                .style('background-color','#505050')
                .append('td')
                .attr('colspan', numColumns)
                .attr('height','20px')
           
            })

            //HEADER SWATCH ACTION ///DUAL ACTION TEMPLATE
            d3.selectAll('#sd-header-swatch').on('dragend', function() {


              key = formatObj[d3.select(this).attr('key')]
              value = d3.select(this).attr('value')
              
              value = eval(value)
              $.each(key, function(itemNo, item) {
                  rows.style(item, value[itemNo])
           
              })
              d3.selectAll('[highlight="true"]').style('border', '1px solid black').attr('highlight','false')

            })

            d3.selectAll('#remove-tht-align').on('dragend', function() {


              
                  rows.each(function() {

                    var oldText = d3.select(this).html()
                    d3.select(this).html(oldText.replace(/\u2007/g,''))
                  })
                  d3.selectAll('[highlight="true"]').style('border', '1px solid black').attr('highlight','false')
           
              })
              

          

          /////////////////
          //CLICK ACTIONS//
          /////////////////

          //COLOR SWATCH CLICK
          d3.selectAll('.sd-color-swatch').on('click', function() {

            d3.selectAll('.sd-color-swatch').style('border', '')
            d3.selectAll('.sd-header-swatch').style('border', '')
            d3.selectAll('.sd-color-picker').style('border', '')
            value = d3.select(this).attr('value')
            key = formatObj[d3.select(this).attr('key')]
            d3.select(this).style('border', '3px solid #FDC60D')
          })

          d3.selectAll('#sd-header-swatch').on('click', function() {

            d3.selectAll('#sd-header-swatch').style('border', '')
            d3.selectAll('.color-swatch').style('border', '')
            d3.selectAll('.sd-color-picker').style('border', '')

            value = d3.select(this).attr('value')
            key = formatObj[d3.select(this).attr('key')]
            d3.select(this).style('border', '3px solid #FDC60D')
          })

          d3.selectAll('.sd-color-picker').on('click', function() {

            d3.selectAll('.sd-color-swatch').style('border', '')
            d3.selectAll('.sd-header-swatch').style('border', '')
            d3.selectAll('.sd-color-picker').style('border', '')
            value = $(this).val()
            key = formatObj[d3.select(this).attr('key')]
            d3.select(this).style('border', '3px solid #FDC60D')
          })


          //CELL CLICK
          d3.selectAll('td').on('click', function() {

            if (key=='colspan') {
              value = $('input#colspan').val()
              d3.select(this).attr(key, value)
            }
            else if (key == 'remove') {
              d3.select(this).remove()
            }
            else if (Array.isArray(key)) {
              value = eval(value)
              var cell = d3.select(this)
              $.each(key, function(itemNo, item) {
                cell.style(item, value[itemNo])
              })
            }
            else {
              d3.select(this).style(key, value)
            }
              
              
          })

          //CELL CLEAR
          d3.selectAll('td').on('dblclick', function() {
            
            d3.select(this)
              .style('background-color','')
              .style('color','')
              .style('text-decoration','')
              .style('text-align','')
              .style('font-weight','')
          })

          //RESET BUTTON!
          d3.select('#reset').on('click', function() {

            d3.selectAll('td')
            .style('background-color','')
            .style('color','')
            .style('text-decoration','')
            .style('text-align','')
            .style('font-weight','')
            
            d3.selectAll('.table-rows')
            .style('background-color','')
            .style('color','')
            .style('text-decoration','')
            .style('text-align','')
            .style('font-weight','')

            d3.selectAll('tr#row-added')
            .remove()

          })

        d3.selectAll('#edit').on('click', function() {

          clearTable()

          htmlIn = $('#Text2').val() //gets data as a string

          d3.select('#sd-tableizer-container')
            .style('max-width',tableWidth + 'px')
            .attr('site', site)
            .append('div')
            .attr('class', 'table-container')
            .style('background-color', 'white')
            .html(htmlIn)

          $('#html-out').on('click',function(){

            if ($('input[name="sortable"]').is(':checked')) {

                textHTML =  $('#sd-tableizer-container').html()

            }
            else {
              textHTML = $('#sd-tableizer-container').html()
            }
            $('#Text2').val(textHTML)
        })
        interactionBuild()
      })

      d3.selectAll('#clear').on('click', function() {
         
          clearTable()

      })




}

///////         ******************
//GO!//     ///CODE BEGINS RUN HERE///
///////         ******************


d3.selectAll('#go').on('click', function(){

  
  stringData = $('#Text1').val() //gets data as a string


  parser = $('[name="parser"]').val() //gets parser option
  tableWidth = $('input#width').val()

  delimiter = selectParser(parser, stringData)
  
  
  headerArray = stringData.split('\n')[0].split(delimiter)
  dataArrayLen = stringData.split('\n').length
  dataArray = stringData.split('\n').splice(1,dataArrayLen-1)
  
  dataTable = buildDataArray(dataArray,delimiter)
  buildTable(dataTable)
  interactionBuild()

})

//RESETS ROWS
$(document).on('mouseup', function() {
  interactionBuild()

})



