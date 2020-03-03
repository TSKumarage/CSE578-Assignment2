$(document).ready(function(){
    $('.header').height($(window).height());
});

/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
}

var year_buttons = document.getElementsByClassName("year_btn");
var i;

var main = d3.select("#main");
var court = main.select("#court");
var results = main.select("#results");
var player1 = main.select("#player1");
var player2 = main.select("#player2");
var chart = main.select("#chart");

function draw_chart(year) {

    chart.select("svg").remove();

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .tickSize(0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var color = d3.scale.ordinal()
        .range(["blue","green"]);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<span style='color:white'>" + d.value + "</span> <strong>%</strong>";
        });

    var svg = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style('display', "block");

    svg.call(tip);

    d3.csv("10yearAUSOpenMatchesFinal.csv", function(error, data) {

        data.forEach(function (item) {
            if(item.year == year){

                var scaleUp = 100;
                var chart_dic = [
                    { 'statCluster' : '% Net Points', 'values' : [{'value': Math.round(item.net1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.net2*scaleUp), 'pName': item.player2}]},
                    { 'statCluster' : '% Breaks', 'values' : [{'value': Math.round(item.break1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.break2*scaleUp), 'pName': item.player2}]},
                    { 'statCluster' : '% Returns', 'values' : [{'value': Math.round(item.return1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.return2*scaleUp), 'pName': item.player2}]},
                    { 'statCluster' : '% First Point Won', 'values' : [{'value': Math.round(item.firstPointWon1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.firstPointWon2*scaleUp), 'pName': item.player2}]},
                    { 'statCluster' : '% Second Point Won', 'values' : [{'value': Math.round(item.secPointWon1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.secPointWon2*scaleUp), 'pName': item.player2}]},
                    { 'statCluster' : '% First Serves', 'values' : [{'value': Math.round(item.firstServe1*scaleUp), 'pName': item.player1}, {'value': Math.round(item.firstServe2*scaleUp), 'pName': item.player2}]}
                    ];

                var statCategory = chart_dic.map(function(d) { return d.statCluster; });
                var players = chart_dic[0].values.map(function(d) { return d.pName; });

                x0.domain(statCategory);
                x1.domain(players).rangeRoundBands([0, x0.rangeBand()]);
                y.domain([0, 100]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .style('opacity','0')
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .style('font-weight','bold')
                    .text("Percentage");

                svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

                var slice = svg.selectAll(".slice")
                    .data(chart_dic)
                    .enter().append("g")
                    .attr("class", "g")
                    .attr("transform",function(d) { return "translate(" + x0(d.statCluster) + ",0)"; });

                slice.selectAll("rect")
                    .data(function(d) { return d.values; })
                    .enter().append("rect")
                    .attr("width", x1.rangeBand())
                    .attr("x", function(d) { return x1(d.pName); })
                    .style("fill", function(d) { return color(d.pName) })
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return height - y(0); })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);

                slice.selectAll("rect")
                    .transition()
                    .delay(function (d) {return Math.random()*1000;})
                    .duration(1000)
                    .attr("y", function(d) { return y(d.value); })
                    .attr("height", function(d) { return height - y(d.value); });

                //Legend
                var legend = svg.selectAll(".legend")
                    .data(chart_dic[0].values.map(function(d) { return d.pName; }).reverse())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
                    .style("opacity","0");

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d) { return color(d); });

                legend.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) {return d; });

                legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

            }

        });

    });

}


function update_info(year) {

    // Remove previous player images
    court.select("#player1-img").select("svg").remove();
    court.select("#player2-img").select("svg").remove();
    court.select("#winner").select("svg").remove();
    court.select("#vs").select("svg").remove();
    court.select("#winner-txt").text("");
    results.text("");
    player1.text("");
    player2.text("");

    d3.csv("10yearAUSOpenMatchesFinal.csv", function(error, data) {
        data.forEach(function (item) {
            if(item.year == year){

                var player1_img = String(item.player1)+'.png';
                var player2_image = String(item.player2)+ '.png';
                var winner = String(item.winner)+ '.png';
                var path = 'images/';

                var img1 = court.select("#player1-img").append("svg").append("image")
                    .attr('xlink:href',path+player1_img)
                    .attr("width",300)
                    .attr("height",150)
                    .attr("opacity","0.0")
                    .style("display","inline");

                var img2 = court.select("#player2-img").append("svg").append("image")
                    .attr('xlink:href',path+player2_image)
                    .attr("width",300)
                    .attr("height",150)
                    .attr("opacity","0.0")
                    .style("display","inline");


                var vs = court.select("#vs").append("svg").append("image")
                    .attr('xlink:href','images/vs1.png')
                    .attr("width",300)
                    .attr("height",150)
                    .attr("opacity","0.0")
                    .attr("class", "invert")
                    .style("display","inline");

                var winnerImg = court.select("#winner").append("svg").append("image")
                    .attr('xlink:href',path+winner)
                    .attr("width",300)
                    .attr("height",150)
                    .attr("opacity","0.0")
                    .style("display","inline");

                court.select("#winner-txt").transition().duration(6000).delay(2000).text("Winner: "+item.winner);
                results.transition().duration(6000).delay(2000).text(item.results);
                player1.transition().duration(3000).delay(1000).text(item.player1);
                player2.transition().duration(3000).delay(1000).text(item.player2);

                img1.transition().duration(2000).style("opacity", 1);
                img2.transition().duration(2000).style("opacity", 1);
                vs.transition().duration(2000).style("opacity", 1);
                winnerImg.transition().duration(4500).style("opacity", 1);
            }

        });
    });
}

for (i = 0; i < year_buttons.length; i++) {

    (function () {
        var year = 2004 + i;
        year_buttons[i].addEventListener("click", function() {
            main.select("#scroll").style("display", "block");
            
            // scroll_button = document.getElementById("scroll");
            // scroll_button.style.display="block";
            update_info(year);
            draw_chart(year);
        }, false);
    }());

}


